from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class IncidentReport(db.Model):
    """Store incident reports with AI analysis"""
    __tablename__ = 'incident_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # User relationship (optional for anonymous reports)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_anonymous = db.Column(db.Boolean, default=True)
    
    # Basic incident details
    who_involved = db.Column(db.String(100))
    who_sub_option = db.Column(db.String(100))
    incident_type = db.Column(db.String(100))
    incident_sub_type = db.Column(db.String(200))
    location = db.Column(db.String(100))
    location_detail = db.Column(db.String(200))
    
    # Impact details
    impact = db.Column(db.String(100))
    impact_detail_severity = db.Column(db.String(50))
    impact_detail_symptoms = db.Column(db.String(100))
    impact_detail_harm_type = db.Column(db.String(100))
    impact_detail_medical = db.Column(db.String(50))
    impact_detail_financial = db.Column(db.String(50))
    impact_detail_loss_type = db.Column(db.String(100))
    impact_detail_reputation = db.Column(db.String(100))
    impact_detail_ongoing = db.Column(db.String(100))
    impact_detail_fear_level = db.Column(db.String(50))
    impact_detail_fear_type = db.Column(db.String(100))
    impact_detail_sleep = db.Column(db.String(50))
    impact_detail_sleep_type = db.Column(db.String(100))
    impact_detail_other = db.Column(db.Text)
    
    # Time details
    incident_date = db.Column(db.Date)
    incident_time = db.Column(db.String(50))
    first_time = db.Column(db.String(10))
    frequency = db.Column(db.String(50))
    
    # Optional additional details
    additional_details = db.Column(db.Text)
    
    # AI Analysis
    ai_summary = db.Column(db.Text)
    
    # Community sharing
    posted_to_community = db.Column(db.Boolean, default=False)
    report_to_police = db.Column(db.Boolean, default=False)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<IncidentReport {self.id}>'
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': self.id,
            'who_involved': self.who_involved,
            'incident_type': self.incident_type,
            'location': self.location,
            'impact': self.impact,
            'incident_date': self.incident_date.strftime('%Y-%m-%d') if self.incident_date else None,
            'ai_summary': self.ai_summary,
            'posted_to_community': self.posted_to_community,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }



class EmergencyContact(db.Model):
    """Store emergency contacts for SOS alerts"""
    __tablename__ = 'emergency_contacts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Contact details
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    relationship = db.Column(db.String(50), nullable=False)  # Mother, Friend, Sibling, etc.
    
    # Priority order (1-4)
    priority = db.Column(db.Integer, default=1)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('emergency_contacts', lazy=True))
    
    def __repr__(self):
        return f'<EmergencyContact {self.name} for User {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'relationship': self.relationship,
            'priority': self.priority
        }


class SOSAlert(db.Model):
    """Store SOS alert events and their status"""
    __tablename__ = 'sos_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Alert details
    trigger_time = db.Column(db.DateTime, default=datetime.utcnow)
    trigger_method = db.Column(db.String(50), default='button')  # button, shake, voice
    
    # Location at trigger
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_accuracy = db.Column(db.Float, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolution_pin_verified = db.Column(db.Boolean, default=False)
    
    # Recording details
    audio_recording_url = db.Column(db.String(500), nullable=True)
    video_recording_url = db.Column(db.String(500), nullable=True)
    
    # Alert sent status
    contacts_notified = db.Column(db.Integer, default=0)
    notification_sent_at = db.Column(db.DateTime, nullable=True)
    
    # Battery level at trigger
    battery_level = db.Column(db.Integer, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('sos_alerts', lazy=True))
    
    def __repr__(self):
        return f'<SOSAlert {self.id} User {self.user_id} Active:{self.is_active}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'trigger_time': self.trigger_time.isoformat() if self.trigger_time else None,
            'is_active': self.is_active,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'contacts_notified': self.contacts_notified,
            'battery_level': self.battery_level,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }


class UserPreference(db.Model):
    """Store user preferences for safe routes"""
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Route preferences
    prefer_well_lit = db.Column(db.Boolean, default=True)
    prefer_populated = db.Column(db.Boolean, default=True)
    prefer_main_roads = db.Column(db.Boolean, default=False)
    safety_weight = db.Column(db.Float, default=0.7)
    distance_weight = db.Column(db.Float, default=0.3)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('preferences', uselist=False))
    
    def __repr__(self):
        return f'<UserPreference User {self.user_id}>'
    
    def to_dict(self):
        return {
            'prefer_well_lit': self.prefer_well_lit,
            'prefer_populated': self.prefer_populated,
            'prefer_main_roads': self.prefer_main_roads,
            'safety_weight': self.safety_weight,
            'distance_weight': self.distance_weight
        }


class RouteFeedback(db.Model):
    """Store user feedback on safe routes"""
    __tablename__ = 'route_feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Route details
    route_hash = db.Column(db.String(64), nullable=False)
    start_lat = db.Column(db.Float, nullable=False)
    start_lon = db.Column(db.Float, nullable=False)
    end_lat = db.Column(db.Float, nullable=False)
    end_lon = db.Column(db.Float, nullable=False)
    
    # Feedback
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    felt_safe = db.Column(db.Boolean, nullable=True)
    would_use_again = db.Column(db.Boolean, nullable=True)
    issues = db.Column(db.Text, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('route_feedback', lazy=True), foreign_keys=[user_id])
    
    def __repr__(self):
        return f'<RouteFeedback {self.id} Rating:{self.rating}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'felt_safe': self.felt_safe,
            'would_use_again': self.would_use_again,
            'issues': self.issues,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# Community Feed Models
class CommunityPost(db.Model):
    """Community support posts (Reddit-style)"""
    __tablename__ = 'community_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for anonymous
    content = db.Column(db.Text, nullable=False)
    is_anonymous = db.Column(db.Boolean, default=False)
    
    # AI Moderation
    is_moderated = db.Column(db.Boolean, default=False)
    moderation_status = db.Column(db.String(20), default='pending')  # pending/approved/flagged/rejected
    moderation_flags = db.Column(db.Text, nullable=True)  # JSON string of flagged words
    
    # Engagement counts
    like_count = db.Column(db.Integer, default=0)
    comment_count = db.Column(db.Integer, default=0)
    share_count = db.Column(db.Integer, default=0)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('community_posts', lazy=True), foreign_keys=[user_id])
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('PostLike', backref='post', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<CommunityPost {self.id}>'
    
    def to_dict(self, current_user_id=None):
        user_liked = False
        if current_user_id:
            user_liked = any(like.user_id == current_user_id for like in self.likes)
        
        return {
            'id': self.id,
            'content': self.content,
            'is_anonymous': self.is_anonymous,
            'user': {
                'id': self.user.id if self.user and not self.is_anonymous else None,
                'username': self.user.username if self.user and not self.is_anonymous else 'Anonymous',
                'avatar': None  # Can add avatar later
            } if self.user or self.is_anonymous else None,
            'like_count': self.like_count,
            'comment_count': self.comment_count,
            'share_count': self.share_count,
            'user_liked': user_liked,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'moderation_status': self.moderation_status
        }

class Comment(db.Model):
    """Comments on community posts"""
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('community_posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for anonymous
    parent_comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)  # For nested comments
    content = db.Column(db.Text, nullable=False)
    is_anonymous = db.Column(db.Boolean, default=False)
    
    # AI Moderation
    is_moderated = db.Column(db.Boolean, default=False)
    moderation_status = db.Column(db.String(20), default='pending')
    moderation_flags = db.Column(db.Text, nullable=True)
    
    # Engagement
    like_count = db.Column(db.Integer, default=0)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('comments', lazy=True), foreign_keys=[user_id])
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy=True)
    likes = db.relationship('CommentLike', backref='comment', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Comment {self.id}>'
    
    def to_dict(self, current_user_id=None):
        user_liked = False
        if current_user_id:
            user_liked = any(like.user_id == current_user_id for like in self.likes)
        
        return {
            'id': self.id,
            'post_id': self.post_id,
            'content': self.content,
            'is_anonymous': self.is_anonymous,
            'user': {
                'id': self.user.id if self.user and not self.is_anonymous else None,
                'username': self.user.username if self.user and not self.is_anonymous else 'Anonymous'
            } if self.user or self.is_anonymous else None,
            'like_count': self.like_count,
            'user_liked': user_liked,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'parent_comment_id': self.parent_comment_id,
            'moderation_status': self.moderation_status
        }

class PostLike(db.Model):
    """Likes on community posts"""
    __tablename__ = 'post_likes'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('community_posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('post_likes', lazy=True))
    
    # Unique constraint: one like per user per post
    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', name='unique_post_like'),)
    
    def __repr__(self):
        return f'<PostLike {self.id}>'

class CommentLike(db.Model):
    """Likes on comments"""
    __tablename__ = 'comment_likes'
    
    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('comment_likes', lazy=True))
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('comment_id', 'user_id', name='unique_comment_like'),)
    
    def __repr__(self):
        return f'<CommentLike {self.id}>'

