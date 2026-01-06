import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { searchPlace } from '../services/api';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

interface TopSearchBarProps {
    onSearch: (destination: string, origin?: [number, number]) => void;
}

const TopSearchBar: React.FC<TopSearchBarProps> = ({ onSearch }) => {
    const [searchValue, setSearchValue] = useState('');
    const { position } = useGeolocation(true);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { setEndLocation, setStartLocation } = useAppContext();
    const [tips, setTips] = useState<string>('');

    useEffect(() => {
        if (position) {
            setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        }
    }, [position]);

    // Debounced search
    useEffect(() => {
        if (!searchValue.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                console.log('🔍 Searching for:', searchValue);
                const results = await searchPlace(searchValue);
                console.log('✅ Got API response:', results);
                console.log('Response structure:', JSON.stringify(results, null, 2));

                // Handle different response formats (SAME AS SIDEBAR)
                let places = [];
                if (Array.isArray(results)) {
                    // Direct array response
                    places = results;
                    console.log('📦 Direct array format');
                } else if (results.places && Array.isArray(results.places)) {
                    // Nested in places property
                    places = results.places;
                    console.log('📦 Nested in .places property');
                } else if (results.results && Array.isArray(results.results)) {
                    // Nested in results property
                    places = results.results;
                    console.log('📦 Nested in .results property');
                }

                console.log('Extracted places:', places, 'Count:', places.length);

                setSearchResults(places);
                setShowResults(places.length > 0);
            } catch (error) {
                console.error('❌ Search error:', error);
                setSearchResults([]);
                setShowResults(false);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleSelectPlace = (place: any) => {
        setSearchValue(place.display_name);
        setShowResults(false);

        // Set destination
        setEndLocation({
            lat: parseFloat(place.lat),
            lon: parseFloat(place.lon),
            name: place.display_name
        });

        // Set origin to current location
        if (currentLocation) {
            setStartLocation({
                lat: currentLocation[0],
                lon: currentLocation[1],
                name: 'Current Location'
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            handleSelectPlace(searchResults[0]);
        }
    };

    return (
        <div className="top-search-bar">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-container">
                    {/* Location Icon */}
                    <div className="search-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                    </div>

                    {/* Search Input */}
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search destination"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => searchValue && setShowResults(true)}
                    />

                    {/* Clear button */}
                    {searchValue && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => {
                                setSearchValue('');
                                setSearchResults([]);
                                setShowResults(false);
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </form>

            {/* Autocomplete Results - Clean Design */}
            {showResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="search-result-item"
                            onClick={() => handleSelectPlace(result)}
                        >
                            <div className="result-icon">📍</div>
                            <div className="result-text">
                                <div className="result-name">{result.display_name?.split(',')[0]}</div>
                                <div className="result-address">{result.display_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loading indicator */}
            {isSearching && (
                <div className="search-loading-indicator">
                    <div className="loading-spinner"></div>
                    <span>Searching...</span>
                </div>
            )}

            {/* Current Location Indicator */}
            {!currentLocation && (
                <div className="location-loading">
                    <div className="loading-spinner"></div>
                    <span>Getting your location...</span>
                </div>
            )}
        </div>
    );
};

export default TopSearchBar;
