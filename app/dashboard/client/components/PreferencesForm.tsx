'use client';

import { useState, useEffect } from 'react';
import { CompanySettings } from '../types/settings';
import { getCompanySettings, updateCompanySettings } from '@/lib/supabase/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PreferencesForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState<Partial<CompanySettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          router.push('/login');
          return;
        }

        if (!session) {
          router.push('/login');
          return;
        }

        await loadPreferences();
      } catch (err) {
        console.error('Error in session check:', err);
        router.push('/login');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const loadPreferences = async () => {
    try {
      const settings = await getCompanySettings();
      if (settings) {
        setFormData({
          targeting: settings.targeting,
          marketing_goal: settings.marketing_goal,
        });
      }
    } catch (err: any) {
      console.error('Error loading preferences:', err);
      setError(err.message || 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const settings = await getCompanySettings();
      if (!settings?.name) {
        throw new Error('Please complete your company settings first');
      }

      const preferencesData: Partial<CompanySettings> = {
        name: settings.name,
        targeting: formData.targeting,
        marketing_goal: formData.marketing_goal,
      };

      await updateCompanySettings(preferencesData);
      setSuccess(true);
      toast.success('Preferences saved successfully!');
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err.message || 'Failed to save preferences');
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Preferences saved successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="marketing_goal" className="block text-sm font-medium text-gray-700">
            Marketing Goal
          </label>
          <textarea
            id="marketing_goal"
            name="marketing_goal"
            rows={3}
            value={formData.marketing_goal || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
            placeholder="What are your marketing objectives? (e.g., Increase brand awareness, Generate leads, Drive sales)"
          />
        </div>

        <div>
          <label htmlFor="targeting" className="block text-sm font-medium text-gray-700">
            Target Audience
          </label>
          <textarea
            name="targeting"
            id="targeting"
            rows={4}
            value={formData.targeting || ''}
            onChange={handleInputChange}
            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
            placeholder="Describe your target audience, including demographics, interests, and behaviors..."
          />
          <p className="text-sm text-gray-500 mt-1">
            This helps us better understand your audience and provide more relevant recommendations.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
} 