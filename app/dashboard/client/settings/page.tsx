'use client';

import { useState, useEffect } from 'react';
import SettingsForm from '../components/SettingsForm';
import PreferencesForm from '../components/PreferencesForm';
import DeleteAccountForm from '../components/DeleteAccountForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'preferences' | 'delete'>('settings');
  const [isOwner, setIsOwner] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: settings, error: settingsError } = await supabase
          .from('company_settings')
          .select('user_id')
          .single();
        
        if (settingsError) throw settingsError;

        setIsOwner(settings?.user_id === user?.id);
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [supabase]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your company profile, preferences, and account settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('settings')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Company Settings
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Preferences
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('delete')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'delete'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-red-700 hover:border-red-300'
                  }
                `}
              >
                Delete Account
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'settings' && <SettingsForm />}
          {activeTab === 'preferences' && <PreferencesForm />}
          {activeTab === 'delete' && isOwner && <DeleteAccountForm />}
        </div>
      </div>
    </div>
  );
} 