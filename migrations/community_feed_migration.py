"""Recreate community feed tables with new schema

Run with: python migrations/community_feed_migration.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import db, CommunityPost, PostLike, CommentLike, Comment
from app.auth_models import User
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Recreating community feed tables with new schema...")
    
    # Drop old tables if they exist (in correct order due to foreign keys)
    with db.engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS comment_likes"))
        conn.execute(text("DROP TABLE IF EXISTS post_likes"))
        conn.execute(text("DROP TABLE IF EXISTS comments"))
        conn.execute(text("DROP TABLE IF EXISTS community_posts"))
        conn.commit()
    
    print("✅ Dropped old tables")
    
    # Create all tables with new schema
    db.create_all()
    print("✅ Created new tables!")
    
    # Add sample posts
    print("Adding sample community posts...")
    
    user = User.query.first()
    user_id = user.id if user else None
    
    sample_posts = [
        {
            'content': """Today I took a different route home and felt so much safer. The Safe Routes feature in this app helped me choose a well-lit path through busy areas instead of my usual shortcut. It took 5 minutes longer but I felt confident the entire way. Thank you for creating this tool! 💜""",
            'is_anonymous': False,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 12,
            'comment_count': 3
        },
        {
            'content': """I want to share my experience with workplace harassment. After months of uncomfortable comments and behavior from a colleague, I finally reported it using the incident documentation features here. Having everything documented properly gave me the confidence to approach HR. The situation is now being addressed. If you're going through something similar, don't stay silent. 🌟""",
            'is_anonymous': True,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 28,
            'comment_count': 7
        },
        {
            'content': """PSA: If you're ever feeling unsafe on public transport, don't hesitate to use the SOS feature. I had to use it yesterday when someone was following me off the bus. The app sent my location to my emergency contacts immediately and I got to a crowded area quickly. Stay safe everyone! 🚨""",
            'is_anonymous': False,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 45,
            'comment_count': 12
        },
        {
            'content': """Just wanted to say thank you to this amazing community. Reading everyone's stories and support has helped me so much. I recently ended an abusive relationship and seeing others share their strength gives me courage every day. We're all in this together. 💪❤️""",
            'is_anonymous': True,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 67,
            'comment_count': 15
        },
        {
            'content': """Does anyone have recommendations for self-defense classes in the city? I want to feel more empowered and prepared. Looking for beginner-friendly options, preferably women-only classes. Thanks in advance! 🥋""",
            'is_anonymous': False,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 19,
            'comment_count': 8
        },
        {
            'content': """Important reminder: Your safety is more important than being polite. If something or someone makes you uncomfortable, trust your instincts. You don't owe anyone an explanation. Remove yourself from the situation however you can. Your gut feeling is there for a reason. 🎯""",
            'is_anonymous': False,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 89,
            'comment_count': 6
        },
        {
            'content': """I reported street harassment for the first time today. Used the app to document everything including time, location, and description. Even though it was small, it felt good to take action. Every report helps build awareness and creates safer communities. Don't underestimate the power of speaking up. ✊""",
            'is_anonymous': True,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 34,
            'comment_count': 9
        },
        {
            'content': """For anyone struggling: It's okay to not be okay. Reach out to friends, family, or professionals. The emergency contacts feature in this app is there for a reason. You're not alone, and you deserve support and safety. One day at a time. 🌈""",
            'is_anonymous': True,
            'user_id': user_id,
            'is_moderated': True,
            'moderation_status': 'approved',
            'like_count': 52,
            'comment_count': 11
        }
    ]
    
    for post_data in sample_posts:
        post = CommunityPost(**post_data)
        db.session.add(post)
    
    db.session.commit()
    print(f"✅ Added {len(sample_posts)} sample posts!")
    
    print("\n🎉 Migration complete! Restart your backend server.")
