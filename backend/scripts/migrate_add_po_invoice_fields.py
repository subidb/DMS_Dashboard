"""
Migration script to add po_number and invoice_number fields to documents table.
Run this script once to update your existing database.
"""
import sqlite3
import os
import sys

# Get the database path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
db_path = os.path.join(backend_dir, "dms_database.db")

def migrate_database():
    """Add po_number and invoice_number columns to documents table"""
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        print("   The database will be created automatically when you start the backend.")
        return
    
    print(f"📦 Migrating database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(documents)")
        columns = [column[1] for column in cursor.fetchall()]
        
        migrations_applied = []
        
        # Add po_number column if it doesn't exist
        if "po_number" not in columns:
            print("  ➕ Adding po_number column...")
            cursor.execute("ALTER TABLE documents ADD COLUMN po_number TEXT")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_documents_po_number ON documents(po_number)")
            migrations_applied.append("po_number")
        else:
            print("  ✓ po_number column already exists")
        
        # Add invoice_number column if it doesn't exist
        if "invoice_number" not in columns:
            print("  ➕ Adding invoice_number column...")
            cursor.execute("ALTER TABLE documents ADD COLUMN invoice_number TEXT")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_documents_invoice_number ON documents(invoice_number)")
            migrations_applied.append("invoice_number")
        else:
            print("  ✓ invoice_number column already exists")
        
        conn.commit()
        conn.close()
        
        if migrations_applied:
            print(f"✅ Migration completed successfully! Added: {', '.join(migrations_applied)}")
        else:
            print("✅ Database is already up to date!")
        
    except sqlite3.Error as e:
        print(f"❌ Database migration failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_database()

