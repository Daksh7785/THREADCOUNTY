import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// --- DATABASE INTERFACES ---
export interface Profile {
  id: string;
  email: string;
  name: string;
  company?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  plan: 'Free' | 'Student' | 'Professional' | 'Enterprise';
  storage_used: number; // in bytes
  created_at: string;
  is_demo?: boolean;
  expires_at?: string;
}

export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_path: string;
  created_at: string;
  is_demo?: boolean;
  expires_at?: string;
}

export interface Report {
  id: string;
  upload_id: string;
  user_id: string;
  warp_count: number;
  weft_count: number;
  thread_density: number; // warp + weft
  fabric_type: string;
  confidence: number; // e.g. 0.96
  suggestions: string[];
  created_at: string;
  is_demo?: boolean;
  expires_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_demo?: boolean;
  expires_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  is_demo?: boolean;
  expires_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_on_analysis_complete: boolean;
  email_on_upload_success: boolean;
  email_on_subscription_changes: boolean;
  email_newsletter: boolean;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  details: any;
  timestamp: string;
}

// Local db file path
const DATA_DIR = process.env.VERCEL 
  ? '/tmp' 
  : path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const ORIGINAL_DB_FILE = path.join(__dirname, '..', '..', 'data', 'db.json');

// Interface for DB representation in local JSON file
interface LocalDatabase {
  users: { [id: string]: { passwordHash: string } };
  profiles: Profile[];
  uploads: Upload[];
  reports: Report[];
  contact_messages: ContactMessage[];
  notifications: Notification[];
  notification_preferences?: NotificationPreferences[];
  audit_logs?: AuditLog[];
}

class ThreadCountyDatabase {
  private isLocalMode = true;
  private supabase: SupabaseClient | null = null;
  private localData: LocalDatabase = {
    users: {},
    profiles: [],
    uploads: [],
    reports: [],
    contact_messages: [],
    notifications: [],
    notification_preferences: [],
    audit_logs: []
  };

  private dataLoaded = false;
  private isInitializing = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isLocalMode = false;
        console.log('[Database] Supabase connection configured.');
      } catch (err) {
        console.error('[Database] Failed to init Supabase client, falling back to Local Mode:', err);
        this.isLocalMode = true;
      }
    } else {
      console.log('[Database] Supabase env variables not found. Running in Local Sandbox Mode.');
      this.isLocalMode = true;
    }

    if (this.isLocalMode) {
      this.ensureDataLoaded().catch(console.error);
    }
  }

  public getMode() {
    return this.isLocalMode ? 'local' : 'supabase';
  }

  public async ensureDataLoaded() {
    if (this.dataLoaded) return;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return;
    }

    this.isInitializing = true;
    try {
      await this.initLocalDb();
      this.dataLoaded = true;
    } finally {
      this.isInitializing = false;
    }
  }

  // --- LOCAL SANDBOX INITIALIZATION ---
  private async initLocalDb() {
    const KV_DB_URL = 'https://kvdb.io/tcdakshbucket92929292/db';
    try {
      const res = await fetch(KV_DB_URL);
      if (res.ok) {
        const text = await res.text();
        this.localData = JSON.parse(text);
        console.log('[Database] Loaded persistent database from KV store.');
        return;
      }
    } catch (err) {
      console.warn('[Database] Failed to load from KV store:', err);
    }

    if (!process.env.VERCEL && !fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (process.env.VERCEL && !fs.existsSync(DB_FILE)) {
      try {
        if (fs.existsSync(ORIGINAL_DB_FILE)) {
          fs.copyFileSync(ORIGINAL_DB_FILE, DB_FILE);
          console.log('[Database] Copied seed db.json to /tmp/db.json');
        }
      } catch (copyErr) {
        console.error('[Database] Failed to copy seed db.json to /tmp:', copyErr);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.localData = JSON.parse(fileContent);
      } catch (err) {
        console.error('[Database] Error reading local db.json, re-initializing:', err);
        this.createSeedData();
      }
    } else {
      this.createSeedData();
    }
  }

  private createSeedData() {
    const bcrypt = require('bcryptjs');
    const demoHash = bcrypt.hashSync('Demo@1234', 10);

    const adminId = 'u-admin-seed';
    const freeId = 'u-free-seed';
    const studentId = 'u-student-seed';
    const proId = 'u-pro-seed';
    const entId = 'u-enterprise-seed';

    this.localData = {
      users: {
        [adminId]: { passwordHash: demoHash },
        [freeId]: { passwordHash: demoHash },
        [studentId]: { passwordHash: demoHash },
        [proId]: { passwordHash: demoHash },
        [entId]: { passwordHash: demoHash }
      },
      profiles: [
        {
          id: adminId,
          email: 'admin@threadcounty.app',
          name: 'County Admin',
          company: 'ThreadCounty Inc.',
          role: 'admin',
          plan: 'Enterprise',
          storage_used: 0,
          created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: freeId,
          email: 'demo.free@threadcounty.app',
          name: 'Frank Free',
          company: 'Freelance Design Co',
          role: 'user',
          plan: 'Free',
          storage_used: 1024 * 512,
          created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: studentId,
          email: 'demo.student@threadcounty.app',
          name: 'Sam Student',
          company: 'National Institute of Fashion Technology',
          role: 'user',
          plan: 'Student',
          storage_used: 1024 * 1024 * 2,
          created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: proId,
          email: 'demo.pro@threadcounty.app',
          name: 'Pam Professional',
          company: 'Apex Textile Labs',
          role: 'user',
          plan: 'Professional',
          storage_used: 1024 * 1024 * 8,
          created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: entId,
          email: 'demo.enterprise@threadcounty.app',
          name: 'Elena Enterprise',
          company: 'Vanguard Weaving Mills',
          role: 'user',
          plan: 'Enterprise',
          storage_used: 1024 * 1024 * 15,
          created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()
        }
      ],
      uploads: [
        {
          id: 'up-001',
          user_id: proId,
          filename: 'sample_denim.png',
          original_name: 'denim_raw_500x.png',
          file_size: 1048576,
          file_path: 'backend/uploads/sample_denim.png',
          created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'up-002',
          user_id: proId,
          filename: 'sample_linen.png',
          original_name: 'linen_blend.png',
          file_size: 524288,
          file_path: 'backend/uploads/sample_linen.png',
          created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'up-003',
          user_id: studentId,
          filename: 'sample_cotton.png',
          original_name: 'cotton_twill.png',
          file_size: 1048576 * 2,
          file_path: 'backend/uploads/sample_cotton.png',
          created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
        }
      ],
      reports: [
        {
          id: 'rep-001',
          upload_id: 'up-001',
          user_id: proId,
          warp_count: 65,
          weft_count: 55,
          thread_density: 120,
          fabric_type: 'Denim / Twill Weave',
          confidence: 0.97,
          suggestions: [
            'Warp tension is slightly high; reduce by 2% to avoid fabric curling.',
            'Weft alignment shows high consistency. Excellent weave uniformity.',
            'Optimal yarn count detected for 12oz heavy denim manufacturing.'
          ],
          created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'rep-002',
          upload_id: 'up-002',
          user_id: proId,
          warp_count: 40,
          weft_count: 42,
          thread_density: 82,
          fabric_type: 'Linen / Plain Weave',
          confidence: 0.94,
          suggestions: [
            'Plain weave structure verified with standard 1:1 interlacing.',
            'Warp yarn thickness variation is within 3% tolerance.',
            'Recommended for lightweight summer shirting.'
          ],
          created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'rep-003',
          upload_id: 'up-003',
          user_id: studentId,
          warp_count: 60,
          weft_count: 62,
          thread_density: 122,
          fabric_type: 'Cotton / Plain Weave',
          confidence: 0.98,
          suggestions: [
            'High quality combed cotton thread profile detected.',
            'Warp/weft ratio close to 1:1, offering optimal tensile strength.',
            'Suitable for medium-weight shirts and home textiles.'
          ],
          created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
        }
      ],
      contact_messages: [
        {
          id: 'msg-001',
          name: 'Sarah Connor',
          email: 'sarah.c@skytextiles.com',
          subject: 'Enterprise Plan Custom Quote',
          message: 'Hi, we operate 15 factories across the EU and want to integrate ThreadCounty AI into our automated inspection lines. Do you support private cloud deployments?',
          created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'msg-002',
          name: 'Rajesh Patel',
          email: 'rajesh@suratweaves.in',
          subject: 'Calibration Question',
          message: 'Is there a way to calibrate the pixel-to-millimeter ratio for custom macro lens attachments?',
          created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
        }
      ],
      notifications: [
        {
          id: 'notif-001',
          user_id: proId,
          title: 'Welcome to ThreadCounty!',
          message: 'Explore automated thread density and warp/weft analysis by uploading your first fabric image.',
          is_read: true,
          created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'notif-002',
          user_id: proId,
          title: 'Report Ready',
          message: 'Your analysis report for sample_linen.png has been generated successfully.',
          is_read: false,
          created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        }
      ]
    };
    this.saveLocalDb();
  }

  private saveLocalDb() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[Database] Failed to write db.json to disk:', err);
    }
    
    // Save to KV store asynchronously
    const KV_DB_URL = 'https://kvdb.io/tcdakshbucket92929292/db';
    fetch(KV_DB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.localData)
    }).then((res: any) => {
      if (res.ok) {
        console.log('[Database] Successfully saved database to KV store.');
      } else {
        console.warn('[Database] Failed to save database to KV store:', res.statusText);
      }
    }).catch((err: any) => {
      console.warn('[Database] Error saving database to KV store:', err);
    });
  }

  // --- PUBLIC API WRAPPER METHODS ---

  // User Auth & Profiles
  public async getProfileByEmail(email: string): Promise<Profile | null> {
    if (this.isLocalMode) {
      return this.localData.profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
    } else {
      const { data, error } = await this.supabase!
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      if (error) return null;
      return data;
    }
  }

  public async getProfileById(id: string): Promise<Profile | null> {
    if (this.isLocalMode) {
      return this.localData.profiles.find(p => p.id === id) || null;
    } else {
      const { data, error } = await this.supabase!
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    }
  }

  public async getUserPasswordHash(userId: string): Promise<string | null> {
    if (this.isLocalMode) {
      return this.localData.users[userId]?.passwordHash || null;
    } else {
      // In Supabase, standard auth flow handles passwords. We'd map custom fields.
      // For general full-stack Node-Express authentication, the node backend can handle it,
      // or delegate to Supabase Auth. We simulate custom Node Auth mapping to Supabase auth users
      // or a local profiles table. We'll support local hashes in custom users table.
      const { data, error } = await this.supabase!
        .from('users_auth')
        .select('password_hash')
        .eq('id', userId)
        .single();
      if (error) return null;
      return data.password_hash;
    }
  }

  public async createUser(email: string, passwordHash: string, name: string, company?: string): Promise<Profile> {
    const id = this.isLocalMode ? 'u-' + Math.random().toString(36).substr(2, 9) : '';
    const newProfile: Profile = {
      id,
      email,
      name,
      company: company || '',
      role: 'user',
      plan: 'Free',
      storage_used: 0,
      created_at: new Date().toISOString()
    };

    if (this.isLocalMode) {
      newProfile.id = id;
      this.localData.users[id] = { passwordHash };
      this.localData.profiles.push(newProfile);
      this.saveLocalDb();
      return newProfile;
    } else {
      // Create user auth in Supabase (simplified representation for full-stack API integration)
      const { data: authData, error: authError } = await this.supabase!
        .from('users_auth')
        .insert([{ email, password_hash: passwordHash }])
        .select()
        .single();
      if (authError) throw authError;

      newProfile.id = authData.id;
      const { data, error } = await this.supabase!
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  public async updateProfile(id: string, updates: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>): Promise<Profile> {
    if (this.isLocalMode) {
      const idx = this.localData.profiles.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('User profile not found');
      this.localData.profiles[idx] = { ...this.localData.profiles[idx], ...updates } as Profile;
      this.saveLocalDb();
      return this.localData.profiles[idx];
    } else {
      const { data, error } = await this.supabase!
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  public async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    if (this.isLocalMode) {
      if (this.localData.users[id]) {
        this.localData.users[id].passwordHash = passwordHash;
        this.saveLocalDb();
        return true;
      }
      return false;
    } else {
      const { error } = await this.supabase!
        .from('users_auth')
        .update({ password_hash: passwordHash })
        .eq('id', id);
      return !error;
    }
  }

  public async deleteUserAccount(id: string): Promise<boolean> {
    if (this.isLocalMode) {
      delete this.localData.users[id];
      this.localData.profiles = this.localData.profiles.filter(p => p.id !== id);
      this.localData.uploads = this.localData.uploads.filter(u => u.user_id !== id);
      this.localData.reports = this.localData.reports.filter(r => r.user_id !== id);
      this.localData.notifications = this.localData.notifications.filter(n => n.user_id !== id);
      this.saveLocalDb();
      return true;
    } else {
      const { error } = await this.supabase!.from('profiles').delete().eq('id', id);
      const { error: authError } = await this.supabase!.from('users_auth').delete().eq('id', id);
      return !error && !authError;
    }
  }

  public async createUpload(userId: string, filename: string, originalName: string, fileSize: number, filePath: string): Promise<Upload> {
    const id = this.isLocalMode ? 'up-' + Math.random().toString(36).substr(2, 9) : randomUUID();
    
    let dbFilePath = filePath;
    if (this.isLocalMode && filePath.startsWith('data:')) {
      // Save base64 image data to a separate KV key asynchronously
      const KV_IMG_URL = `https://kvdb.io/tcdakshbucket92929292/img_${id}`;
      fetch(KV_IMG_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: filePath
      }).catch((err: any) => console.error('[Database] Failed to save image to KV:', err));
      
      // Store reference path in DB instead of the giant base64 string
      dbFilePath = `api/upload/raw/${id}`;
    }

    const newUpload: Upload = {
      id,
      user_id: userId,
      filename,
      original_name: originalName,
      file_size: fileSize,
      file_path: dbFilePath,
      created_at: new Date().toISOString()
    };

    if (this.isLocalMode) {
      this.localData.uploads.push(newUpload);
      // Increment user's storage quota
      const userIdx = this.localData.profiles.findIndex(p => p.id === userId);
      if (userIdx !== -1) {
        this.localData.profiles[userIdx].storage_used += fileSize;
      }
      this.saveLocalDb();
      return newUpload;
    } else {
      const { data, error } = await this.supabase!
        .from('uploads')
        .insert([newUpload])
        .select()
        .single();
      if (error) throw error;

      // Update storage used in profile
      await this.supabase!.rpc('increment_storage', { user_id: userId, size_bytes: fileSize });
      return data;
    }
  }

  public async getUploadById(id: string): Promise<Upload | null> {
    if (this.isLocalMode) {
      return this.localData.uploads.find(u => u.id === id) || null;
    } else {
      const { data, error } = await this.supabase!
        .from('uploads')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    }
  }

  public async getUploadsByUser(userId: string): Promise<Upload[]> {
    if (this.isLocalMode) {
      return this.localData.uploads.filter(u => u.user_id === userId);
    } else {
      const { data, error } = await this.supabase!
        .from('uploads')
        .select('*')
        .eq('user_id', userId);
      if (error) return [];
      return data;
    }
  }

  // Reports
  public async createReport(uploadId: string, userId: string, warpCount: number, weftCount: number, fabricType: string, confidence: number, suggestions: string[]): Promise<Report> {
    const id = this.isLocalMode ? 'rep-' + Math.random().toString(36).substr(2, 9) : randomUUID();
    const newReport: Report = {
      id,
      upload_id: uploadId,
      user_id: userId,
      warp_count: warpCount,
      weft_count: weftCount,
      thread_density: warpCount + weftCount,
      fabric_type: fabricType,
      confidence,
      suggestions,
      created_at: new Date().toISOString()
    };

    if (this.isLocalMode) {
      this.localData.reports.push(newReport);
      this.saveLocalDb();
      return newReport;
    } else {
      const { data, error } = await this.supabase!
        .from('reports')
        .insert([newReport])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  public async getReportById(id: string): Promise<Report | null> {
    if (this.isLocalMode) {
      return this.localData.reports.find(r => r.id === id) || null;
    } else {
      const { data, error } = await this.supabase!
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    }
  }

  public async getReportByUploadId(uploadId: string): Promise<Report | null> {
    if (this.isLocalMode) {
      return this.localData.reports.find(r => r.upload_id === uploadId) || null;
    } else {
      const { data, error } = await this.supabase!
        .from('reports')
        .select('*')
        .eq('upload_id', uploadId)
        .single();
      if (error) return null;
      return data;
    }
  }

  public async getReportsByUser(userId: string): Promise<Report[]> {
    if (this.isLocalMode) {
      return this.localData.reports.filter(r => r.user_id === userId);
    } else {
      const { data, error } = await this.supabase!
        .from('reports')
        .select('*')
        .eq('user_id', userId);
      if (error) return [];
      return data;
    }
  }

  public async deleteReport(id: string, userId: string, isAdmin = false): Promise<boolean> {
    if (this.isLocalMode) {
      const reportIdx = this.localData.reports.findIndex(r => r.id === id && (isAdmin || r.user_id === userId));
      if (reportIdx === -1) return false;

      const report = this.localData.reports[reportIdx];

      // Clean up upload record too
      const uploadIdx = this.localData.uploads.findIndex(u => u.id === report.upload_id);
      if (uploadIdx !== -1) {
        const upload = this.localData.uploads[uploadIdx];
        // Decrement storage
        const userIdx = this.localData.profiles.findIndex(p => p.id === report.user_id);
        if (userIdx !== -1) {
          this.localData.profiles[userIdx].storage_used = Math.max(0, this.localData.profiles[userIdx].storage_used - upload.file_size);
        }
        // Clean up file if it exists
        try {
          const absolutePath = path.resolve(upload.file_path);
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } catch (e) {
          console.error('[Database] Failed to delete file on disk:', e);
        }

        this.localData.uploads.splice(uploadIdx, 1);
      }

      this.localData.reports.splice(reportIdx, 1);
      this.saveLocalDb();
      return true;
    } else {
      // In Supabase, delete trigger would handle this or we execute them sequentially
      const reportQuery = this.supabase!.from('reports').delete().eq('id', id);
      if (!isAdmin) {
        reportQuery.eq('user_id', userId);
      }
      const { error } = await reportQuery;
      return !error;
    }
  }

  // Contact Messages
  public async createContactMessage(name: string, email: string, subject: string, message: string): Promise<ContactMessage> {
    const id = this.isLocalMode ? 'msg-' + Math.random().toString(36).substr(2, 9) : randomUUID();
    const newMessage: ContactMessage = {
      id,
      name,
      email,
      subject,
      message,
      created_at: new Date().toISOString()
    };

    if (this.isLocalMode) {
      this.localData.contact_messages.push(newMessage);
      this.saveLocalDb();
      return newMessage;
    } else {
      const { data, error } = await this.supabase!
        .from('contact_messages')
        .insert([newMessage])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  public async getAllContactMessages(): Promise<ContactMessage[]> {
    if (this.isLocalMode) {
      return this.localData.contact_messages;
    } else {
      const { data, error } = await this.supabase!.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return data;
    }
  }

  // Notifications
  public async createNotification(userId: string, title: string, message: string): Promise<Notification> {
    const id = this.isLocalMode ? 'notif-' + Math.random().toString(36).substr(2, 9) : randomUUID();
    const newNotif: Notification = {
      id,
      user_id: userId,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (this.isLocalMode) {
      this.localData.notifications.push(newNotif);
      this.saveLocalDb();
      return newNotif;
    } else {
      const { data, error } = await this.supabase!
        .from('notifications')
        .insert([newNotif])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  public async getNotificationsByUser(userId: string): Promise<Notification[]> {
    if (this.isLocalMode) {
      return this.localData.notifications.filter(n => n.user_id === userId);
    } else {
      const { data, error } = await this.supabase!
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data;
    }
  }

  public async markNotificationRead(id: string, userId: string): Promise<boolean> {
    if (this.isLocalMode) {
      const notif = this.localData.notifications.find(n => n.id === id && n.user_id === userId);
      if (notif) {
        notif.is_read = true;
        this.saveLocalDb();
        return true;
      }
      return false;
    } else {
      const { error } = await this.supabase!
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);
      return !error;
    }
  }

  public async getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    if (this.isLocalMode) {
      let notifs = this.localData.notifications.filter(n => n.user_id === userId);
      if (unreadOnly) {
        notifs = notifs.filter(n => !n.is_read);
      }
      return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      let query = this.supabase!
        .from('notifications')
        .select('*')
        .eq('user_id', userId);
      
      if (unreadOnly) {
        query = query.eq('is_read', false);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return [];
      return data;
    }
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    if (this.isLocalMode) {
      this.localData.notifications.forEach(n => {
        if (n.user_id === userId) n.is_read = true;
      });
      this.saveLocalDb();
    } else {
      await this.supabase!
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
    }
  }

  public async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const defaultPrefs: NotificationPreferences = {
      user_id: userId,
      email_on_analysis_complete: true,
      email_on_upload_success: true,
      email_on_subscription_changes: true,
      email_newsletter: false
    };

    if (this.isLocalMode) {
      if (!this.localData.notification_preferences) {
        this.localData.notification_preferences = [];
      }
      const prefs = this.localData.notification_preferences.find(p => p.user_id === userId);
      return prefs || defaultPrefs;
    } else {
      const { data, error } = await this.supabase!
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) return defaultPrefs;
      return data;
    }
  }

  public async updateNotificationPreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const defaultPrefs: NotificationPreferences = {
      user_id: userId,
      email_on_analysis_complete: true,
      email_on_upload_success: true,
      email_on_subscription_changes: true,
      email_newsletter: false
    };

    if (this.isLocalMode) {
      if (!this.localData.notification_preferences) {
        this.localData.notification_preferences = [];
      }
      const idx = this.localData.notification_preferences.findIndex(p => p.user_id === userId);
      if (idx !== -1) {
        this.localData.notification_preferences[idx] = { ...this.localData.notification_preferences[idx], ...updates };
      } else {
        this.localData.notification_preferences.push({ ...defaultPrefs, ...updates });
      }
      this.saveLocalDb();
      return this.getNotificationPreferences(userId);
    } else {
      const current = await this.getNotificationPreferences(userId);
      const { data, error } = await this.supabase!
        .from('notification_preferences')
        .upsert({ ...current, ...updates, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  public async createAuditLog(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: this.isLocalMode ? 'audit-' + Math.random().toString(36).substr(2, 9) : randomUUID(),
      ...log
    };

    if (this.isLocalMode) {
      if (!this.localData.audit_logs) {
        this.localData.audit_logs = [];
      }
      this.localData.audit_logs.push(newLog);
      this.saveLocalDb();
      return newLog;
    } else {
      const { data, error } = await this.supabase!
        .from('audit_logs')
        .insert([newLog])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    if (this.isLocalMode) {
      if (!this.localData.audit_logs) {
        this.localData.audit_logs = [];
      }
      return [...this.localData.audit_logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      const { data, error } = await this.supabase!
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) return [];
      return data;
    }
  }


  // Admin Dashboard stats
  public async getAdminStats(): Promise<{
    totalUsers: number;
    totalUploads: number;
    totalReports: number;
    totalMessages: number;
    activePlans: { Free: number; Student: number; Professional: number; Enterprise: number };
  }> {
    if (this.isLocalMode) {
      const totalUsers = this.localData.profiles.length;
      const totalUploads = this.localData.uploads.length;
      const totalReports = this.localData.reports.length;
      const totalMessages = this.localData.contact_messages.length;

      const activePlans = { Free: 0, Student: 0, Professional: 0, Enterprise: 0 };
      this.localData.profiles.forEach(p => {
        if (p.plan in activePlans) {
          activePlans[p.plan as keyof typeof activePlans]++;
        } else {
          activePlans.Free++;
        }
      });

      return { totalUsers, totalUploads, totalReports, totalMessages, activePlans };
    } else {
      // In Supabase we count rows
      const { count: usersCount } = await this.supabase!.from('profiles').select('*', { count: 'exact', head: true });
      const { count: uploadsCount } = await this.supabase!.from('uploads').select('*', { count: 'exact', head: true });
      const { count: reportsCount } = await this.supabase!.from('reports').select('*', { count: 'exact', head: true });
      const { count: messagesCount } = await this.supabase!.from('contact_messages').select('*', { count: 'exact', head: true });

      const { data: plansData } = await this.supabase!.from('profiles').select('plan');
      const activePlans = { Free: 0, Student: 0, Professional: 0, Enterprise: 0 };
      plansData?.forEach(p => {
        const plan = p.plan as keyof typeof activePlans;
        if (activePlans[plan] !== undefined) activePlans[plan]++;
      });

      return {
        totalUsers: usersCount || 0,
        totalUploads: uploadsCount || 0,
        totalReports: reportsCount || 0,
        totalMessages: messagesCount || 0,
        activePlans
      };
    }
  }

  public async getAllProfilesAdmin(): Promise<Profile[]> {
    if (this.isLocalMode) {
      return this.localData.profiles;
    } else {
      const { data, error } = await this.supabase!.from('profiles').select('*');
      if (error) return [];
      return data;
    }
  }

  public async getAllReportsAdmin(): Promise<Report[]> {
    if (this.isLocalMode) {
      return this.localData.reports;
    } else {
      const { data, error } = await this.supabase!.from('reports').select('*');
      if (error) return [];
      return data;
    }
  }

  public async getAllUploadsAdmin(): Promise<Upload[]> {
    if (this.isLocalMode) {
      return this.localData.uploads;
    } else {
      const { data, error } = await this.supabase!.from('uploads').select('*');
      if (error) return [];
      return data;
    }
  }

  // --- DEMO DATA SEEDING & AUTO-CLEANUP ---
  public async generateDemoDataForUser(userId: string, durationHours = 24): Promise<void> {
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
    
    // 1. Clear any existing demo records for this user first
    if (this.isLocalMode) {
      this.localData.uploads = this.localData.uploads.filter(u => !(u.user_id === userId && u.is_demo));
      this.localData.reports = this.localData.reports.filter(r => !(r.user_id === userId && r.is_demo));
      this.localData.notifications = this.localData.notifications.filter(n => !(n.user_id === userId && n.is_demo));
    } else {
      await this.supabase!.from('reports').delete().eq('user_id', userId).eq('is_demo', true);
      await this.supabase!.from('uploads').delete().eq('user_id', userId).eq('is_demo', true);
      await this.supabase!.from('notifications').delete().eq('user_id', userId).eq('is_demo', true);
    }

    // 2. Define the 6 realistic fabric analysis templates
    const templates = [
      {
        filename: 'sample_denim.png',
        original_name: 'denim_raw_500x.png',
        warp_count: 68,
        weft_count: 56,
        fabric_type: 'Denim / Twill Weave',
        confidence: 0.96,
        daysAgo: 14,
        file_path: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60',
        suggestions: [
          'Warp tension is slightly high; reduce by 2% to avoid fabric curling.',
          'Weft alignment shows high consistency. Excellent weave uniformity.',
          'Optimal yarn count detected for 12oz heavy denim manufacturing.'
        ]
      },
      {
        filename: 'sample_linen.png',
        original_name: 'linen_blend.png',
        warp_count: 42,
        weft_count: 44,
        fabric_type: 'Linen / Plain Weave',
        confidence: 0.94,
        daysAgo: 11,
        file_path: 'https://images.unsplash.com/photo-1576570734306-e3de0c8e0c7a?w=500&auto=format&fit=crop&q=60',
        suggestions: [
          'Plain weave structure verified with standard 1:1 interlacing.',
          'Warp yarn thickness variation is within 3% tolerance.',
          'Recommended for lightweight summer shirting.'
        ]
      },
      {
        filename: 'sample_cotton.png',
        original_name: 'combed_cotton_180.png',
        warp_count: 92,
        weft_count: 88,
        fabric_type: 'Cotton / Plain Weave',
        confidence: 0.97,
        daysAgo: 8,
        file_path: 'https://images.unsplash.com/photo-1598104358861-120d82998a4a?w=500&auto=format&fit=crop&q=60',
        suggestions: [
          'High quality combed cotton thread profile detected.',
          'Warp/weft ratio close to 1:1, offering optimal tensile strength.',
          'Suitable for medium-weight shirts and home textiles.'
        ]
      },
      {
        filename: 'sample_silk.png',
        original_name: 'mulberry_silk.png',
        warp_count: 120,
        weft_count: 110,
        fabric_type: 'Silk / Satin Weave',
        confidence: 0.99,
        daysAgo: 5,
        file_path: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=500&auto=format&fit=crop&q=60',
        suggestions: [
          'Extremely fine thread profile with high density Satin structure.',
          'Surface luster index is optimal. No snags or thread breaks detected.',
          'Ideal for premium sleepwear and luxury garments.'
        ]
      },
      {
        filename: 'sample_wool.png',
        original_name: 'merino_wool_blend.png',
        warp_count: 32,
        weft_count: 28,
        fabric_type: 'Wool / Twill Weave',
        confidence: 0.92,
        daysAgo: 2,
        file_path: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
        suggestions: [
          'Low density coarse fiber weave verified. Standard wool twill structure.',
          'Pilling risk is low based on fiber surface density analysis.',
          'Suitable for winter outerwear and blankets.'
        ]
      },
      {
        filename: 'sample_cotton.png',
        original_name: 'canvas_heavy.png',
        warp_count: 55,
        weft_count: 52,
        fabric_type: 'Cotton / Canvas Weave',
        confidence: 0.95,
        daysAgo: 0,
        file_path: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=500&auto=format&fit=crop&q=60',
        suggestions: [
          'Heavy cotton canvas structure verified.',
          'Warp count is stable, weft shows minor alignment shift of 1.5%.',
          'Highly recommended for heavy duty bags, sails, or upholstery.'
        ]
      }
    ];

    // 3. Insert uploads and reports
    let totalSeededSize = 0;
    for (const t of templates) {
      const uploadId = this.isLocalMode ? 'up-demo-' + Math.random().toString(36).substr(2, 9) : randomUUID();
      const reportId = this.isLocalMode ? 'rep-demo-' + Math.random().toString(36).substr(2, 9) : randomUUID();
      const createdAt = new Date(Date.now() - t.daysAgo * 24 * 3600 * 1000).toISOString();
      const fileSize = Math.floor(500000 + Math.random() * 800000); // 500kb to 1.3mb
      totalSeededSize += fileSize;

      const upload: Upload = {
        id: uploadId,
        user_id: userId,
        filename: t.filename,
        original_name: t.original_name,
        file_size: fileSize,
        file_path: t.file_path || `backend/uploads/${t.filename}`,
        created_at: createdAt,
        is_demo: true,
        expires_at: expiresAt
      };

      const report: Report = {
        id: reportId,
        upload_id: uploadId,
        user_id: userId,
        warp_count: t.warp_count,
        weft_count: t.weft_count,
        thread_density: t.warp_count + t.weft_count,
        fabric_type: t.fabric_type,
        confidence: t.confidence,
        suggestions: t.suggestions,
        created_at: createdAt,
        is_demo: true,
        expires_at: expiresAt
      };

      if (this.isLocalMode) {
        this.localData.uploads.push(upload);
        this.localData.reports.push(report);
      } else {
        const { error: upError } = await this.supabase!.from('uploads').insert([upload]);
        if (upError) {
          console.warn('[Database] Failed to insert demo upload, retrying without is_demo/expires_at:', upError.message);
          const { is_demo, expires_at, ...cleanUpload } = upload as any;
          const { error: upRetryError } = await this.supabase!.from('uploads').insert([cleanUpload]);
          if (upRetryError) throw upRetryError;
        }

        const { error: repError } = await this.supabase!.from('reports').insert([report]);
        if (repError) {
          console.warn('[Database] Failed to insert demo report, retrying without is_demo/expires_at:', repError.message);
          const { is_demo, expires_at, ...cleanReport } = report as any;
          const { error: repRetryError } = await this.supabase!.from('reports').insert([cleanReport]);
          if (repRetryError) throw repRetryError;
        }
      }
    }

    // 4. Insert Notifications
    const notifications = [
      { title: 'Welcome to ThreadCounty! 🎉', message: 'Explore automated thread density and warp/weft analysis by uploading your first fabric image.', daysAgo: 14 },
      { title: 'Demo Analysis Ready', message: 'Your analysis report for denim_raw_500x.png has been generated successfully.', daysAgo: 14 },
      { title: 'Demo Analysis Ready', message: 'Your analysis report for linen_blend.png has been generated successfully.', daysAgo: 11 },
      { title: 'Invoice Generated', message: 'Your monthly statement is ready for download in your billing settings.', daysAgo: 5 },
      { title: 'Demo Session Active 💡', message: `Welcome to the test drive! 6 sample reports have been seeded. Note that these records will auto-expire and purge in ${durationHours} hours.`, daysAgo: 0 }
    ];

    for (const n of notifications) {
      const notifId = this.isLocalMode ? 'notif-demo-' + Math.random().toString(36).substr(2, 9) : randomUUID();
      const createdAt = new Date(Date.now() - n.daysAgo * 24 * 3600 * 1000).toISOString();

      const notif: Notification = {
        id: notifId,
        user_id: userId,
        title: n.title,
        message: n.message,
        is_read: n.daysAgo > 0,
        created_at: createdAt,
        is_demo: true,
        expires_at: expiresAt
      };

      if (this.isLocalMode) {
        this.localData.notifications.push(notif);
      } else {
        const { error: notifError } = await this.supabase!.from('notifications').insert([notif]);
        if (notifError) {
          console.warn('[Database] Failed to insert demo notification, retrying without is_demo/expires_at:', notifError.message);
          const { is_demo, expires_at, ...cleanNotif } = notif as any;
          const { error: notifRetryError } = await this.supabase!.from('notifications').insert([cleanNotif]);
          if (notifRetryError) throw notifRetryError;
        }
      }
    }

    // 5. Update user's storage quota
    if (this.isLocalMode) {
      const idx = this.localData.profiles.findIndex(p => p.id === userId);
      if (idx !== -1) {
        this.localData.profiles[idx].storage_used = this.localData.uploads
          .filter(u => u.user_id === userId)
          .reduce((sum, u) => sum + u.file_size, 0);
      }
      this.saveLocalDb();
    } else {
      const uploads = await this.getUploadsByUser(userId);
      const newStorageUsed = uploads.reduce((sum, u) => sum + u.file_size, 0);
      await this.supabase!
        .from('profiles')
        .update({ storage_used: newStorageUsed })
        .eq('id', userId);
    }
  }

  public async clearDemoDataForUser(userId: string): Promise<void> {
    console.log(`[Database] Clearing all demo data for user: ${userId}`);

    if (this.isLocalMode) {
      // 1. Unlink disk files first (skip standard template resources)
      const demoUploads = this.localData.uploads.filter(u => u.user_id === userId && u.is_demo);
      for (const u of demoUploads) {
        if (u.filename && !u.filename.startsWith('sample_')) {
          try {
            const absolutePath = path.resolve(u.file_path);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          } catch (e) {}
        }
      }

      // 2. Filter local arrays
      this.localData.uploads = this.localData.uploads.filter(u => !(u.user_id === userId && u.is_demo));
      this.localData.reports = this.localData.reports.filter(r => !(r.user_id === userId && r.is_demo));
      this.localData.notifications = this.localData.notifications.filter(n => !(n.user_id === userId && n.is_demo));
      
      // 3. Recalculate storage
      const pIdx = this.localData.profiles.findIndex(p => p.id === userId);
      if (pIdx !== -1) {
        this.localData.profiles[pIdx].storage_used = this.localData.uploads
          .filter(u => u.user_id === userId)
          .reduce((sum, u) => sum + u.file_size, 0);
      }

      this.saveLocalDb();
    } else {
      try {
        const { error: repErr } = await this.supabase!.from('reports').delete().eq('user_id', userId).eq('is_demo', true);
        if (repErr) console.warn('[Database] Failed to clear demo reports in Supabase (possibly missing is_demo):', repErr.message);

        const { error: upErr } = await this.supabase!.from('uploads').delete().eq('user_id', userId).eq('is_demo', true);
        if (upErr) console.warn('[Database] Failed to clear demo uploads in Supabase (possibly missing is_demo):', upErr.message);

        const { error: notifErr } = await this.supabase!.from('notifications').delete().eq('user_id', userId).eq('is_demo', true);
        if (notifErr) console.warn('[Database] Failed to clear demo notifications in Supabase (possibly missing is_demo):', notifErr.message);
      } catch (err: any) {
        console.error('[Database] Failed to run Supabase demo data cleanup:', err.message);
      }

      const uploads = await this.getUploadsByUser(userId);
      const newStorageUsed = uploads.reduce((sum, u) => sum + u.file_size, 0);
      await this.supabase!
        .from('profiles')
        .update({ storage_used: newStorageUsed })
        .eq('id', userId);
    }
  }

  public async cleanupExpiredDemoData(): Promise<void> {
    const now = new Date().toISOString();
    console.log(`[Demo Worker] Checking for expired demo data at ${now}...`);

    if (this.isLocalMode) {
      // 1. Gather all uploads slated for deletion to clean up any files (if not standard templates)
      const expiredUploads = this.localData.uploads.filter(u => u.is_demo && u.expires_at && u.expires_at <= now);
      
      for (const u of expiredUploads) {
        // Only unlink if it's not a shared base sample asset
        if (u.filename && !u.filename.startsWith('sample_')) {
          try {
            const absolutePath = path.resolve(u.file_path);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
              console.log(`[Demo Worker] Unlinked expired file: ${u.file_path}`);
            }
          } catch (e) {
            console.error(`[Demo Worker] Failed to unlink file ${u.file_path}:`, e);
          }
        }
      }

      // 2. Perform filters
      const userIdsToRecalculate = new Set<string>();
      expiredUploads.forEach(u => userIdsToRecalculate.add(u.user_id));

      this.localData.uploads = this.localData.uploads.filter(u => !(u.is_demo && u.expires_at && u.expires_at <= now));
      this.localData.reports = this.localData.reports.filter(r => !(r.is_demo && r.expires_at && r.expires_at <= now));
      this.localData.notifications = this.localData.notifications.filter(n => !(n.is_demo && n.expires_at && n.expires_at <= now));
      this.localData.contact_messages = this.localData.contact_messages.filter(m => !(m.is_demo && m.expires_at && m.expires_at <= now));
      
      // Also filter out any temporary demo users
      const expiredUsers = this.localData.profiles.filter(p => p.is_demo && p.expires_at && p.expires_at <= now);
      for (const p of expiredUsers) {
        delete this.localData.users[p.id];
        console.log(`[Demo Worker] Deleted expired demo user profile and auth: ${p.email}`);
      }
      this.localData.profiles = this.localData.profiles.filter(p => !(p.is_demo && p.expires_at && p.expires_at <= now));

      // 3. Recalculate storage for affected users
      userIdsToRecalculate.forEach(uid => {
        const idx = this.localData.profiles.findIndex(p => p.id === uid);
        if (idx !== -1) {
          this.localData.profiles[idx].storage_used = this.localData.uploads
            .filter(u => u.user_id === uid)
            .reduce((sum, u) => sum + u.file_size, 0);
        }
      });

      this.saveLocalDb();
      console.log(`[Demo Worker] Completed local cleanup. Purged ${expiredUploads.length} uploads.`);
    } else {
      // Supabase cleanups (cascade deleted triggers or sequential deletes)
      try {
        const { data: expiredReports, error: fetchErr } = await this.supabase!
          .from('reports')
          .select('id, upload_id, user_id')
          .eq('is_demo', true)
          .lte('expires_at', now);

        if (fetchErr) {
          console.warn('[Demo Worker] Failed to fetch expired demo reports (likely missing is_demo/expires_at columns):', fetchErr.message);
          return;
        }

        if (expiredReports && expiredReports.length > 0) {
          const reportIds = expiredReports.map(r => r.id);
          const uploadIds = expiredReports.map(r => r.upload_id);
          const userIds = Array.from(new Set(expiredReports.map(r => r.user_id)));

          await this.supabase!.from('reports').delete().in('id', reportIds);
          await this.supabase!.from('uploads').delete().in('id', uploadIds);
          await this.supabase!.from('notifications').delete().eq('is_demo', true).lte('expires_at', now);
          await this.supabase!.from('contact_messages').delete().eq('is_demo', true).lte('expires_at', now);
          await this.supabase!.from('profiles').delete().eq('is_demo', true).lte('expires_at', now);

          // Recalculate storage
          for (const uid of userIds) {
            const uploads = await this.getUploadsByUser(uid);
            const newStorageUsed = uploads.reduce((sum, u) => sum + u.file_size, 0);
            await this.supabase!
              .from('profiles')
              .update({ storage_used: newStorageUsed })
              .eq('id', uid);
          }
          console.log(`[Demo Worker] Completed Supabase cleanup. Purged ${expiredReports.length} reports.`);
        }
      } catch (err: any) {
        console.error('[Demo Worker] Error cleaning up expired demo data:', err.message);
      }
    }
  }
}

export const db = new ThreadCountyDatabase();
export default db;
