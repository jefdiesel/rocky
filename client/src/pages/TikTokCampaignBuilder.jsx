import { useReducer, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import clsx from 'clsx';
import {
  TT_OBJECTIVES, TT_PLACEMENTS, TT_BID_STRATEGIES, TT_CTA_OPTIONS,
  TT_OPTIMIZATION_GOALS, TT_AD_FORMATS,
} from '../utils/tiktokConstants.js';
import PageGuide from '../components/common/PageGuide.jsx';
import api from '../services/api.js';

const initialState = {
  // Step 1: Campaign
  campaignName: '',
  objectiveType: '',
  budgetMode: 'BUDGET_MODE_DAY',
  campaignBudget: '',
  // Step 2: Ad Group
  adgroupName: '',
  adgroupBudget: '',
  bidStrategy: 'BID_TYPE_NO_BID',
  bidAmount: '',
  placements: ['PLACEMENT_TIKTOK'],
  optimizationGoal: 'CLICK',
  startDate: '',
  endDate: '',
  ageMin: 18,
  ageMax: 55,
  gender: 'GENDER_UNLIMITED',
  locations: [],
  sparkAds: false,
  // Step 3: Ad
  adName: '',
  adFormat: 'SINGLE_VIDEO',
  displayName: '',
  adText: '',
  cta: 'LEARN_MORE',
  landingPageUrl: '',
  sparkAdCode: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_PLACEMENT': {
      const pl = state.placements.includes(action.value)
        ? state.placements.filter((p) => p !== action.value)
        : [...state.placements, action.value];
      return { ...state, placements: pl };
    }
    case 'ADD_LOCATION':
      if (!action.value || state.locations.includes(action.value)) return state;
      return { ...state, locations: [...state.locations, action.value] };
    case 'REMOVE_LOCATION':
      return { ...state, locations: state.locations.filter((l) => l !== action.value) };
    default:
      return state;
  }
}

const STEPS = ['Campaign', 'Ad Group', 'Ad', 'Review'];

function validateStep(step, state) {
  const errors = [];
  if (step === 0) {
    if (!state.campaignName.trim()) errors.push('Campaign name is required');
    if (!state.objectiveType) errors.push('Objective is required');
  } else if (step === 1) {
    if (!state.adgroupBudget || parseFloat(state.adgroupBudget) <= 0) errors.push('Ad group budget must be greater than $0');
    if (!state.startDate) errors.push('Start date is required');
    if (state.placements.length === 0) errors.push('At least one placement is required');
  } else if (step === 2) {
    if (!state.adName.trim()) errors.push('Ad name is required');
    if (state.sparkAds && !state.sparkAdCode.trim()) errors.push('Spark Ad authorization code is required');
    if (!state.sparkAds && state.landingPageUrl && !/^https?:\/\/.+\..+/.test(state.landingPageUrl)) {
      errors.push('Landing page URL must be a valid URL');
    }
  }
  return errors;
}

export default function TikTokCampaignBuilder() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [step, setStep] = useState(0);
  const [locationInput, setLocationInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const set = useCallback((field, value) => dispatch({ type: 'SET_FIELD', field, value }), []);

  const canProceed = () => validateStep(step, state).length === 0;

  const handleNext = () => {
    const errors = validateStep(step, state);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const advertiserId = localStorage.getItem('selected_account_id');

      // Step 1: Create campaign
      const campRes = await api.tiktok.createCampaign({
        advertiser_id: advertiserId,
        campaign_name: state.campaignName,
        objective_type: state.objectiveType,
        budget_mode: state.budgetMode,
        budget: parseFloat(state.campaignBudget) || 0,
        operation_status: 'DISABLE',
      });
      const campaignId = campRes.data?.campaign_id;
      if (!campaignId) throw new Error('Failed to create campaign');

      // Step 2: Create ad group
      const agRes = await api.tiktok.createAdGroup({
        advertiser_id: advertiserId,
        campaign_id: campaignId,
        adgroup_name: state.adgroupName || state.campaignName + ' - Ad Group',
        budget: parseFloat(state.adgroupBudget) || 50,
        budget_mode: state.budgetMode,
        bid_type: state.bidStrategy,
        bid_price: state.bidAmount ? parseFloat(state.bidAmount) : undefined,
        placements: state.placements,
        optimization_goal: state.optimizationGoal,
        schedule_start_time: state.startDate ? new Date(state.startDate).toISOString() : undefined,
        schedule_end_time: state.endDate ? new Date(state.endDate).toISOString() : undefined,
        age_groups: [`AGE_${state.ageMin}_${state.ageMax}`],
        gender: state.gender,
        location_ids: state.locations,
        operation_status: 'DISABLE',
      });
      const adgroupId = agRes.data?.adgroup_id;
      if (!adgroupId) throw new Error('Failed to create ad group');

      // Step 3: Create ad
      const adPayload = {
        advertiser_id: advertiserId,
        adgroup_id: adgroupId,
        ad_name: state.adName || state.campaignName + ' - Ad',
        ad_format: state.adFormat,
        display_name: state.displayName || 'Brand',
        ad_text: state.adText || '',
        call_to_action: state.cta,
        landing_page_url: state.landingPageUrl || undefined,
        operation_status: 'DISABLE',
      };
      if (state.sparkAds && state.sparkAdCode) {
        adPayload.tiktok_item_id = state.sparkAdCode;
        adPayload.ad_format = 'SPARK_ADS';
      }

      await api.tiktok.createAd(adPayload);

      navigate('/tiktok/campaigns');
    } catch (err) {
      alert('Failed to create TikTok campaign: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageGuide
        pageKey="tiktok-campaign-builder"
        title="TikTok Campaign Builder"
        tips={[
          'TikTok uses Campaign → Ad Group → Ad (not Ad Set)',
          'Spark Ads let you boost organic TikTok posts — you need an authorization code',
          'Campaigns are created as paused — activate when ready',
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Create TikTok Campaign</h1>
        <button onClick={() => navigate('/tiktok/campaigns')} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={clsx(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                i === step && 'bg-primary-600 text-white',
                i < step && 'bg-primary-600/20 text-primary-400 cursor-pointer hover:bg-primary-600/30',
                i > step && 'bg-zinc-800 text-zinc-500'
              )}
            >
              {i < step ? <Check size={12} /> : <span className="text-2xs">{i + 1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-zinc-600" />}
          </div>
        ))}
      </div>

      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          {validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-400">{err}</p>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-6">

        {/* STEP 1: Campaign */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Campaign Name</label>
              <input type="text" value={state.campaignName} onChange={(e) => set('campaignName', e.target.value)}
                placeholder="e.g., Spring Sale TikTok" className="w-full max-w-md" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">Campaign Objective</label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {TT_OBJECTIVES.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => set('objectiveType', value)}
                    className={clsx(
                      'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all',
                      state.objectiveType === value
                        ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                        : 'border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    )}
                  >
                    <Icon size={20} />
                    <div>
                      <p className="text-xs font-semibold">{label}</p>
                      <p className="mt-0.5 text-2xs text-zinc-500">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Budget Mode</label>
                <div className="flex gap-2">
                  {['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL'].map((bm) => (
                    <button key={bm} onClick={() => set('budgetMode', bm)}
                      className={clsx('rounded-md border px-4 py-2 text-xs font-medium transition-colors',
                        state.budgetMode === bm ? 'border-primary-500 bg-primary-600/10 text-primary-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      )}>
                      {bm === 'BUDGET_MODE_DAY' ? 'Daily' : 'Lifetime'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Campaign Budget (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">$</span>
                  <input type="number" value={state.campaignBudget} onChange={(e) => set('campaignBudget', e.target.value)}
                    placeholder="0.00" className="w-36 pl-7" min="0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Ad Group */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ad Group Name</label>
              <input type="text" value={state.adgroupName} onChange={(e) => set('adgroupName', e.target.value)}
                placeholder={state.campaignName + ' - Ad Group'} className="w-full max-w-md" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ad Group Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">$</span>
                  <input type="number" value={state.adgroupBudget} onChange={(e) => set('adgroupBudget', e.target.value)}
                    placeholder="50.00" className="w-36 pl-7" min="1" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bid Strategy</label>
                <select value={state.bidStrategy} onChange={(e) => set('bidStrategy', e.target.value)} className="w-full">
                  {TT_BID_STRATEGIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {TT_BID_STRATEGIES.find((b) => b.value === state.bidStrategy)?.hasInput && (
                  <div className="mt-2">
                    <label className="mb-1 block text-2xs text-zinc-500">
                      {TT_BID_STRATEGIES.find((b) => b.value === state.bidStrategy)?.inputLabel}
                    </label>
                    <input type="number" value={state.bidAmount} onChange={(e) => set('bidAmount', e.target.value)}
                      className="w-36" placeholder="0.00" min="0" step="0.01" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Schedule</label>
              <div className="flex flex-wrap items-center gap-3">
                <input type="date" value={state.startDate} onChange={(e) => set('startDate', e.target.value)} className="text-xs" />
                <span className="text-xs text-zinc-500">to</span>
                <input type="date" value={state.endDate} onChange={(e) => set('endDate', e.target.value)} className="text-xs" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Placements</label>
              <div className="flex flex-wrap gap-2">
                {TT_PLACEMENTS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-400 cursor-pointer hover:border-zinc-600">
                    <input
                      type="checkbox"
                      checked={state.placements.includes(value)}
                      onChange={() => dispatch({ type: 'TOGGLE_PLACEMENT', value })}
                      className="accent-primary-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Optimization Goal</label>
              <select value={state.optimizationGoal} onChange={(e) => set('optimizationGoal', e.target.value)} className="w-full max-w-xs">
                {TT_OPTIMIZATION_GOALS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-zinc-700 pt-6">
              <label className="mb-3 block text-sm font-medium text-zinc-300">Targeting</label>
              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Age Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="13" max="55" value={state.ageMin}
                      onChange={(e) => set('ageMin', Number(e.target.value))} className="w-16 text-center" />
                    <span className="text-xs text-zinc-500">to</span>
                    <input type="number" min="13" max="55" value={state.ageMax}
                      onChange={(e) => set('ageMax', Number(e.target.value))} className="w-16 text-center" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Gender</label>
                  <div className="flex gap-1">
                    {[
                      { value: 'GENDER_UNLIMITED', label: 'All' },
                      { value: 'GENDER_MALE', label: 'Male' },
                      { value: 'GENDER_FEMALE', label: 'Female' },
                    ].map((g) => (
                      <button key={g.value} onClick={() => set('gender', g.value)}
                        className={clsx('rounded px-3 py-1.5 text-xs font-medium transition-colors',
                          state.gender === g.value ? 'bg-primary-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        )}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-2xs text-zinc-500">Locations (country codes)</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        dispatch({ type: 'ADD_LOCATION', value: locationInput.trim().toUpperCase() });
                        setLocationInput('');
                      }
                    }}
                    placeholder="e.g., US, GB — press Enter" className="flex-1" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {state.locations.map((loc) => (
                    <span key={loc} className="flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                      {loc}
                      <button onClick={() => dispatch({ type: 'REMOVE_LOCATION', value: loc })} className="text-zinc-500 hover:text-zinc-300 text-xs">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Ad */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={state.sparkAds} onChange={(e) => set('sparkAds', e.target.checked)}
                  className="accent-primary-500" />
                Use Spark Ads (boost organic post)
              </label>
            </div>

            {state.sparkAds ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ad Name</label>
                  <input type="text" value={state.adName} onChange={(e) => set('adName', e.target.value)}
                    placeholder="Spark Ad name" className="w-full max-w-md" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Spark Ad Authorization Code</label>
                  <input type="text" value={state.sparkAdCode} onChange={(e) => set('sparkAdCode', e.target.value)}
                    placeholder="Paste authorization code from TikTok post" className="w-full max-w-md font-mono text-xs" />
                  <p className="mt-1 text-2xs text-zinc-600">Get this code from the TikTok app: Post settings → Ad authorization</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Call to Action</label>
                  <select value={state.cta} onChange={(e) => set('cta', e.target.value)} className="w-48">
                    {TT_CTA_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ad Name</label>
                  <input type="text" value={state.adName} onChange={(e) => set('adName', e.target.value)}
                    placeholder={state.campaignName + ' - Ad'} className="w-full max-w-md" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">Ad Format</label>
                  <div className="flex flex-wrap gap-3">
                    {TT_AD_FORMATS.filter((f) => f.value !== 'SPARK_ADS').map(({ value, label }) => (
                      <button key={value} onClick={() => set('adFormat', value)}
                        className={clsx(
                          'rounded-lg border px-4 py-2 text-xs font-medium transition-all',
                          state.adFormat === value
                            ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        )}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-2xs text-zinc-500">Display Name</label>
                    <input type="text" value={state.displayName} onChange={(e) => set('displayName', e.target.value)}
                      className="w-full" placeholder="Brand name shown on ad" />
                  </div>
                  <div>
                    <label className="mb-1 block text-2xs text-zinc-500">Call to Action</label>
                    <select value={state.cta} onChange={(e) => set('cta', e.target.value)} className="w-full">
                      {TT_CTA_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Ad Text</label>
                  <textarea value={state.adText} onChange={(e) => set('adText', e.target.value)}
                    rows={3} className="w-full" placeholder="Your TikTok ad copy..." />
                </div>
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Landing Page URL</label>
                  <input type="url" value={state.landingPageUrl} onChange={(e) => set('landingPageUrl', e.target.value)}
                    className="w-full" placeholder="https://example.com/landing" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Campaign</h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                <dt className="text-xs text-zinc-500">Name</dt>
                <dd className="text-xs text-zinc-200">{state.campaignName}</dd>
                <dt className="text-xs text-zinc-500">Objective</dt>
                <dd className="text-xs text-zinc-200">{TT_OBJECTIVES.find((o) => o.value === state.objectiveType)?.label || state.objectiveType}</dd>
                <dt className="text-xs text-zinc-500">Budget Mode</dt>
                <dd className="text-xs text-zinc-200">{state.budgetMode === 'BUDGET_MODE_DAY' ? 'Daily' : 'Lifetime'}</dd>
                {state.campaignBudget && (
                  <><dt className="text-xs text-zinc-500">Campaign Budget</dt><dd className="text-xs text-zinc-200">${state.campaignBudget}</dd></>
                )}
              </dl>
            </div>

            <div className="border-t border-zinc-700 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Ad Group</h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                <dt className="text-xs text-zinc-500">Name</dt>
                <dd className="text-xs text-zinc-200">{state.adgroupName || state.campaignName + ' - Ad Group'}</dd>
                <dt className="text-xs text-zinc-500">Budget</dt>
                <dd className="text-xs text-zinc-200">${state.adgroupBudget}</dd>
                <dt className="text-xs text-zinc-500">Bid Strategy</dt>
                <dd className="text-xs text-zinc-200">{TT_BID_STRATEGIES.find((b) => b.value === state.bidStrategy)?.label}</dd>
                <dt className="text-xs text-zinc-500">Placements</dt>
                <dd className="text-xs text-zinc-200">{state.placements.map((p) => TT_PLACEMENTS.find((pl) => pl.value === p)?.label || p).join(', ')}</dd>
                <dt className="text-xs text-zinc-500">Schedule</dt>
                <dd className="text-xs text-zinc-200">{state.startDate || 'Not set'} - {state.endDate || 'Ongoing'}</dd>
                <dt className="text-xs text-zinc-500">Targeting</dt>
                <dd className="text-xs text-zinc-200">
                  Ages {state.ageMin}-{state.ageMax}+,
                  {state.gender === 'GENDER_UNLIMITED' ? ' All Genders' : state.gender === 'GENDER_MALE' ? ' Male' : ' Female'}
                  {state.locations.length > 0 && `, ${state.locations.join(', ')}`}
                </dd>
              </dl>
            </div>

            <div className="border-t border-zinc-700 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Ad</h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                <dt className="text-xs text-zinc-500">Name</dt>
                <dd className="text-xs text-zinc-200">{state.adName || state.campaignName + ' - Ad'}</dd>
                <dt className="text-xs text-zinc-500">Format</dt>
                <dd className="text-xs text-zinc-200">{state.sparkAds ? 'Spark Ads' : TT_AD_FORMATS.find((f) => f.value === state.adFormat)?.label}</dd>
                <dt className="text-xs text-zinc-500">CTA</dt>
                <dd className="text-xs text-zinc-200">{TT_CTA_OPTIONS.find((c) => c.value === state.cta)?.label}</dd>
                {state.landingPageUrl && (
                  <><dt className="text-xs text-zinc-500">Landing Page</dt><dd className="break-all text-xs text-primary-400">{state.landingPageUrl}</dd></>
                )}
                {state.sparkAds && state.sparkAdCode && (
                  <><dt className="text-xs text-zinc-500">Spark Ad Code</dt><dd className="text-xs text-zinc-200 font-mono">{state.sparkAdCode.slice(0, 20)}...</dd></>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/tiktok/campaigns')}
          className="flex items-center gap-1 rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft size={14} /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < 3 ? (
          <button onClick={handleNext} disabled={!canProceed()}
            className="flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Campaign'}
          </button>
        )}
      </div>
    </div>
  );
}
