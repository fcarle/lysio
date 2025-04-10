'use client';

import { useState, useEffect } from 'react';
import { CompanySettings, INDUSTRIES, MARKETING_GOALS } from '../types/settings';
import { getCompanySettings, updateCompanySettings, getCurrentUserEmail } from '@/lib/supabase/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

type BudgetFrequency = 'monthly' | 'quarterly' | 'yearly';

export default function SettingsForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState<Partial<CompanySettings>>({
    currency: 'USD',
    budget_frequency: 'monthly' as BudgetFrequency
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [budgetItems, setBudgetItems] = useState<Array<{id: string, service: string, amount: number | ''}>>([]);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
  ];

  const frequencies = [
    { value: 'monthly', label: 'per Month' },
    { value: 'quarterly', label: 'per Quarter' },
    { value: 'yearly', label: 'per Year' }
  ] as const;

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

        // If we have a session, load the settings
        await loadCompanySettings();
      } catch (err) {
        console.error('Error in session check:', err);
        router.push('/login');
      }
    };

    checkSession();

    // Set up auth state change listener
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

  const loadCompanySettings = async () => {
    try {
      const [settings, userEmail] = await Promise.all([
        getCompanySettings(),
        getCurrentUserEmail()
      ]);

      // Create a properly typed settings object
      const typedSettings: Partial<CompanySettings> = {
        ...settings,
        email: userEmail || settings?.email,
        currency: settings?.currency || 'USD',
        // Ensure budget_frequency is always a valid BudgetFrequency value
        budget_frequency: (settings?.budget_frequency === 'monthly' || 
                         settings?.budget_frequency === 'quarterly' || 
                         settings?.budget_frequency === 'yearly') 
                         ? (settings.budget_frequency as BudgetFrequency)
                         : ('monthly' as BudgetFrequency)
      };
      
      // Initialize form with typed settings
      setFormData(typedSettings);

      // Initialize budget items if they exist
      if (settings?.budget_items && Array.isArray(settings.budget_items)) {
        setBudgetItems(settings.budget_items as Array<{id: string, service: string, amount: number | ''}>);
      } else if (settings?.budget) {
        // Convert legacy single budget to budget item
        setBudgetItems([
          { id: uuidv4(), service: 'General', amount: settings.budget as number }
        ]);
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load company settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'budget_frequency') {
      // Only allow valid frequency values
      if (value === 'monthly' || value === 'quarterly' || value === 'yearly') {
        setFormData(prev => ({ ...prev, [name]: value as BudgetFrequency }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBudgetItemChange = (id: string, field: 'service' | 'amount', value: string | number) => {
    setBudgetItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addBudgetItem = () => {
    setBudgetItems(prev => [...prev, { 
      id: uuidv4(), 
      service: '', 
      amount: '' 
    }]);
  };

  const removeBudgetItem = (id: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotalBudget = () => {
    return budgetItems.reduce((total, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : 0;
      return total + amount;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Only include fields that have values
      const settingsData: Partial<CompanySettings> = {
        name: formData.name!, // Required
      };

      // Only add optional fields if they have values
      if (formData.industry) settingsData.industry = formData.industry;
      if (formData.about) settingsData.about = formData.about;
      if (formData.location) settingsData.location = formData.location;
      if (formData.currency) settingsData.currency = formData.currency;
      if (formData.budget_frequency) settingsData.budget_frequency = formData.budget_frequency as BudgetFrequency;
      
      // Add the budget items
      if (budgetItems.length > 0) {
        settingsData.budget_items = budgetItems.filter(item => 
          item.service.trim() !== '' && item.amount !== ''
        );
        // Also set total budget for backwards compatibility
        settingsData.budget = calculateTotalBudget();
      }

      await updateCompanySettings(settingsData);
      setSuccess(true);
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save company settings');
      toast.error(err.message || 'Failed to save company settings');
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
              <p className="text-sm text-green-700">Settings saved successfully!</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-900">
            Company Name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
            required
            placeholder="Enter your company name"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="block w-full rounded-xl border-gray-200 bg-gray-50 pr-10 sm:text-sm cursor-not-allowed"
              disabled
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This is your registered email address
          </p>
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-900">
            Industry
            <span className="text-gray-500 text-xs ml-2">(Optional)</span>
          </label>
          <input
            type="text"
            name="industry"
            id="industry"
            value={formData.industry || ''}
            onChange={handleInputChange}
            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
            placeholder="Enter your industry (e.g., Technology, Healthcare, Retail)"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-900">
            Location
            <span className="text-gray-500 text-xs ml-2">(Optional)</span>
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location || ''}
            onChange={handleInputChange}
            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
            placeholder="Enter your company location"
          />
        </div>

        {/* Budget */}
        <div className="col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-900">
              Budgets
              <span className="text-gray-500 text-xs ml-2">(Optional - Used for matching)</span>
            </label>
            <div className="flex space-x-3 items-center">
              <select
                name="currency"
                value={formData.currency || 'USD'}
                onChange={handleInputChange}
                className="block rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
              <select
                name="budget_frequency"
                value={formData.budget_frequency || 'monthly'}
                onChange={handleInputChange}
                className="block rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Budget Items */}
          <div className="space-y-3 mb-4">
            {budgetItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.service}
                    onChange={(e) => handleBudgetItemChange(item.id, 'service', e.target.value)}
                    placeholder="Service name (e.g. SEO, Digital Ads)"
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
                  />
                </div>
                <div className="col-span-5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {currencies.find(c => c.code === formData.currency)?.symbol}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={item.amount}
                    onChange={(e) => handleBudgetItemChange(item.id, 'amount', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Amount"
                    className="block w-full pl-7 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeBudgetItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addBudgetItem}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Budget Item
            </button>
          </div>
          
          {/* Total Budget Display */}
          {budgetItems.length > 0 && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
              <div className="px-4 py-3">
                <div className="text-white text-xs font-medium uppercase tracking-wider">Total Budget</div>
                <div className="flex items-end mt-1">
                  <span className="text-white text-xl font-bold">
                    {currencies.find(c => c.code === formData.currency)?.symbol}
                    {calculateTotalBudget().toLocaleString()}
                  </span>
                  <span className="text-blue-100 text-xs ml-2 mb-0.5">
                    per {formData.budget_frequency}
                  </span>
                </div>
              </div>
              <div className="px-4 py-2 bg-blue-700 bg-opacity-30">
                <div className="text-blue-100 text-xs">
                  {budgetItems.length} budget {budgetItems.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About Company */}
      <div className="space-y-2">
        <label htmlFor="about" className="block text-sm font-medium text-gray-900">
          About Your Company
          <span className="text-gray-500 text-xs ml-2">(Optional)</span>
        </label>
        <textarea
          name="about"
          id="about"
          rows={4}
          value={formData.about || ''}
          onChange={handleInputChange}
          className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-gray-300"
          placeholder="Tell us about your company, your mission, and what makes you unique..."
        />
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