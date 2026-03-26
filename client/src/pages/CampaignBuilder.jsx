import { useReducer, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Check, Plus, X, Upload, Image, GalleryHorizontal,
  Video, Smartphone, LayoutGrid, Copy, Eye,
} from 'lucide-react';
import clsx from 'clsx';
import {
  OBJECTIVES, BID_STRATEGIES, PLACEMENTS, CTA_OPTIONS, SPECIAL_AD_CATEGORIES,
  OPTIMIZATION_GOALS, ATTRIBUTION_WINDOWS, AD_FORMATS,
} from '../utils/constants.js';
import { buildUTMUrl } from '../utils/format.js';
import PageGuide from '../components/common/PageGuide.jsx';
import api from '../services/api.js';

// --- State management ---
const initialState = {
  // Step 1
  name: '',
  objective: '',
  buyingType: 'AUCTION',
  specialAdCategories: [],
  // Step 2
  budgetType: 'DAILY',
  budgetAmount: '',
  startDate: '',
  endDate: '',
  bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
  bidCap: '',
  placementMode: 'AUTOMATIC',
  selectedPlacements: [],
  optimizationGoal: 'LINK_CLICKS',
  attributionClick: '7d_click',
  attributionView: '1d_view',
  ageMin: 18,
  ageMax: 65,
  gender: 'ALL',
  locations: [],
  interests: [],
  savedAudienceId: '',
  customAudienceIds: [],
  lookalikeAudienceIds: [],
  // Step 3
  adFormat: 'SINGLE_IMAGE',
  assets: [],
  primaryText: '',
  headline: '',
  description: '',
  cta: 'LEARN_MORE',
  destinationUrl: '',
  utmSource: 'facebook',
  utmMedium: 'paid_social',
  utmCampaign: '',
  utmContent: '',
  variants: [],
  // Preview
  previewMode: 'fb_feed',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_SPECIAL_CATEGORY': {
      const cats = state.specialAdCategories.includes(action.value)
        ? state.specialAdCategories.filter((c) => c !== action.value)
        : [...state.specialAdCategories, action.value];
      return { ...state, specialAdCategories: cats };
    }
    case 'TOGGLE_PLACEMENT': {
      const pl = state.selectedPlacements.includes(action.value)
        ? state.selectedPlacements.filter((p) => p !== action.value)
        : [...state.selectedPlacements, action.value];
      return { ...state, selectedPlacements: pl };
    }
    case 'ADD_LOCATION':
      if (!action.value || state.locations.includes(action.value)) return state;
      return { ...state, locations: [...state.locations, action.value] };
    case 'REMOVE_LOCATION':
      return { ...state, locations: state.locations.filter((l) => l !== action.value) };
    case 'ADD_INTEREST':
      if (!action.value || state.interests.includes(action.value)) return state;
      return { ...state, interests: [...state.interests, action.value] };
    case 'REMOVE_INTEREST':
      return { ...state, interests: state.interests.filter((i) => i !== action.value) };
    case 'ADD_VARIANT':
      return { ...state, variants: [...state.variants, { primaryText: '', headline: '', description: '', cta: 'LEARN_MORE' }] };
    case 'UPDATE_VARIANT':
      return {
        ...state,
        variants: state.variants.map((v, i) => i === action.index ? { ...v, [action.field]: action.value } : v),
      };
    case 'REMOVE_VARIANT':
      return { ...state, variants: state.variants.filter((_, i) => i !== action.index) };
    default:
      return state;
  }
}

const STEPS = ['Campaign', 'Ad Set', 'Ad Creative', 'Review'];

const FORMAT_ICONS = {
  SINGLE_IMAGE: Image,
  CAROUSEL: GalleryHorizontal,
  VIDEO: Video,
  STORIES: Smartphone,
  COLLECTION: LayoutGrid,
};

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [step, setStep] = useState(0);
  const [locationInput, setLocationInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = useCallback((field, value) => dispatch({ type: 'SET_FIELD', field, value }), []);

  const canProceed = () => {
    if (step === 0) return state.name && state.objective;
    if (step === 1) return state.budgetAmount > 0;
    if (step === 2) return state.primaryText && state.headline;
    return true;
  };

  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const isVideo = file.type.startsWith('video/');
        const result = isVideo
          ? await api.uploadVideo(formData)
          : await api.uploadImage(formData);
        const asset = result.data || result;
        dispatch({ type: 'SET_FIELD', field: 'assets', value: [...state.assets, asset] });
      } catch (err) {
        console.error('Upload failed:', err.message);
      }
    }
  };

  const handleSubmit = async (draft = false) => {
    setSubmitting(true);
    try {
      const payload = {
        name: state.name,
        objective: state.objective,
        buying_type: state.buyingType,
        special_ad_categories: state.specialAdCategories,
        budget_type: state.budgetType,
        budget_amount: parseFloat(state.budgetAmount) || 0,
        start_date: state.startDate,
        end_date: state.endDate,
        bid_strategy: state.bidStrategy,
        bid_cap: state.bidCap ? parseFloat(state.bidCap) : undefined,
        placement_mode: state.placementMode,
        selected_placements: state.selectedPlacements,
        optimization_goal: state.optimizationGoal,
        attribution_click: state.attributionClick,
        attribution_view: state.attributionView,
        targeting: {
          age_min: state.ageMin,
          age_max: state.ageMax,
          gender: state.gender,
          locations: state.locations,
          interests: state.interests,
          saved_audience_id: state.savedAudienceId,
          custom_audience_ids: state.customAudienceIds,
          lookalike_audience_ids: state.lookalikeAudienceIds,
        },
        ad_format: state.adFormat,
        primary_text: state.primaryText,
        headline: state.headline,
        description: state.description,
        cta: state.cta,
        destination_url: state.destinationUrl,
        utm_source: state.utmSource,
        utm_medium: state.utmMedium,
        utm_campaign: state.utmCampaign,
        utm_content: state.utmContent,
        variants: state.variants,
        assets: state.assets,
      };

      if (draft) {
        await api.saveDraft(payload);
      } else {
        await api.createCampaign(payload);
      }
      navigate('/campaigns');
    } catch (err) {
      alert('Failed to ' + (draft ? 'save draft' : 'submit campaign') + ': ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const fullUtmUrl = buildUTMUrl(state.destinationUrl, {
    utm_source: state.utmSource,
    utm_medium: state.utmMedium,
    utm_campaign: state.utmCampaign || state.name.toLowerCase().replace(/\s+/g, '_'),
    utm_content: state.utmContent,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageGuide
        pageKey="campaign-builder"
        title="Campaign Builder Quick Guide"
        tips={[
          'Complete all 4 steps: Campaign \u2192 Ad Set \u2192 Ad \u2192 Review before submitting',
          "Choose 'PAUSED' status to create without going live immediately",
          'The UTM builder auto-generates tracking parameters for your destination URL',
          'Save as Draft to come back later without losing your configuration',
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Create Campaign</h1>
        <button
          onClick={() => navigate('/campaigns')}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
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

      {/* Step Content */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-6">

        {/* STEP 1: Campaign */}
        {step === 0 && (
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Campaign Name</label>
              <input
                type="text"
                value={state.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g., Summer Sale 2026"
                className="w-full max-w-md"
              />
            </div>

            {/* Objective */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">Campaign Objective</label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {OBJECTIVES.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => set('objective', value)}
                    className={clsx(
                      'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all',
                      state.objective === value
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

            {/* Buying Type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Buying Type</label>
              <div className="flex gap-2">
                {['AUCTION', 'REACH_AND_FREQUENCY'].map((bt) => (
                  <button
                    key={bt}
                    onClick={() => set('buyingType', bt)}
                    className={clsx(
                      'rounded-md border px-4 py-2 text-xs font-medium transition-colors',
                      state.buyingType === bt
                        ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    )}
                  >
                    {bt === 'AUCTION' ? 'Auction' : 'Reach & Frequency'}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Ad Categories */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Special Ad Categories</label>
              <div className="flex flex-wrap gap-2">
                {SPECIAL_AD_CATEGORIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => dispatch({ type: 'TOGGLE_SPECIAL_CATEGORY', value })}
                    className={clsx(
                      'rounded-md border px-3 py-1.5 text-xs transition-colors',
                      state.specialAdCategories.includes(value)
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-2xs text-zinc-600">Select if your ads relate to credit, employment, housing, or social issues.</p>
            </div>
          </div>
        )}

        {/* STEP 2: Ad Set */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Budget */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">Budget</label>
              <div className="flex items-center gap-4 mb-3">
                {['DAILY', 'LIFETIME'].map((bt) => (
                  <label key={bt} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="budgetType"
                      checked={state.budgetType === bt}
                      onChange={() => set('budgetType', bt)}
                      className="accent-primary-500"
                    />
                    {bt === 'DAILY' ? 'Daily Budget' : 'Lifetime Budget'}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">$</span>
                  <input
                    type="number"
                    value={state.budgetAmount}
                    onChange={(e) => set('budgetAmount', e.target.value)}
                    placeholder="0.00"
                    className="w-36 pl-7"
                    min="1"
                  />
                </div>
                <input type="date" value={state.startDate} onChange={(e) => set('startDate', e.target.value)} className="text-xs" />
                <span className="text-xs text-zinc-500">to</span>
                <input type="date" value={state.endDate} onChange={(e) => set('endDate', e.target.value)} className="text-xs" />
              </div>
            </div>

            {/* Bid Strategy */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bid Strategy</label>
              <select value={state.bidStrategy} onChange={(e) => set('bidStrategy', e.target.value)} className="w-72">
                {BID_STRATEGIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {BID_STRATEGIES.find((b) => b.value === state.bidStrategy)?.hasInput && (
                <div className="mt-2">
                  <label className="mb-1 block text-2xs text-zinc-500">
                    {BID_STRATEGIES.find((b) => b.value === state.bidStrategy)?.inputLabel}
                  </label>
                  <input
                    type="number"
                    value={state.bidCap}
                    onChange={(e) => set('bidCap', e.target.value)}
                    className="w-36"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            {/* Placements */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Placements</label>
              <div className="mb-3 flex gap-2">
                {['AUTOMATIC', 'MANUAL'].map((m) => (
                  <button
                    key={m}
                    onClick={() => set('placementMode', m)}
                    className={clsx(
                      'rounded-md border px-4 py-2 text-xs font-medium transition-colors',
                      state.placementMode === m
                        ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    )}
                  >
                    {m === 'AUTOMATIC' ? 'Advantage+ Placements' : 'Manual Placements'}
                  </button>
                ))}
              </div>
              {state.placementMode === 'MANUAL' && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                  {Object.entries(PLACEMENTS).map(([platform, items]) => (
                    <div key={platform}>
                      <p className="mb-2 text-xs font-semibold capitalize text-zinc-300">{platform.replace('_', ' ')}</p>
                      <div className="space-y-1.5">
                        {items.map(({ value, label }) => (
                          <label key={value} className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={state.selectedPlacements.includes(value)}
                              onChange={() => dispatch({ type: 'TOGGLE_PLACEMENT', value })}
                              className="rounded border-zinc-600 accent-primary-500"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Optimization & Attribution */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Optimization Goal</label>
                <select value={state.optimizationGoal} onChange={(e) => set('optimizationGoal', e.target.value)} className="w-full">
                  {OPTIMIZATION_GOALS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Attribution Window</label>
                <div className="flex gap-3">
                  <select value={state.attributionClick} onChange={(e) => set('attributionClick', e.target.value)} className="flex-1">
                    {ATTRIBUTION_WINDOWS.click.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <select value={state.attributionView} onChange={(e) => set('attributionView', e.target.value)} className="flex-1">
                    {ATTRIBUTION_WINDOWS.view.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Audience */}
            <div className="border-t border-zinc-700 pt-6">
              <label className="mb-3 block text-sm font-medium text-zinc-300">Audience Targeting</label>

              {/* Age & Gender */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Age Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="18" max="65" value={state.ageMin}
                      onChange={(e) => set('ageMin', Number(e.target.value))}
                      className="w-16 text-center"
                    />
                    <span className="text-xs text-zinc-500">to</span>
                    <input
                      type="number" min="18" max="65" value={state.ageMax}
                      onChange={(e) => set('ageMax', Number(e.target.value))}
                      className="w-16 text-center"
                    />
                  </div>
                  <input
                    type="range" min="18" max="65"
                    value={state.ageMin}
                    onChange={(e) => set('ageMin', Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Gender</label>
                  <div className="flex gap-1">
                    {['ALL', 'MALE', 'FEMALE'].map((g) => (
                      <button
                        key={g}
                        onClick={() => set('gender', g)}
                        className={clsx(
                          'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                          state.gender === g ? 'bg-primary-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        )}
                      >
                        {g === 'ALL' ? 'All' : g === 'MALE' ? 'Men' : 'Women'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="mb-4">
                <label className="mb-1 block text-2xs text-zinc-500">Locations</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        dispatch({ type: 'ADD_LOCATION', value: locationInput.trim() });
                        setLocationInput('');
                      }
                    }}
                    placeholder="Type a location and press Enter"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {state.locations.map((loc) => (
                    <span key={loc} className="flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                      {loc}
                      <button onClick={() => dispatch({ type: 'REMOVE_LOCATION', value: loc })} className="text-zinc-500 hover:text-zinc-300">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="mb-1 block text-2xs text-zinc-500">Interests & Behaviors</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        dispatch({ type: 'ADD_INTEREST', value: interestInput.trim() });
                        setInterestInput('');
                      }
                    }}
                    placeholder="Search interests and behaviors"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {state.interests.map((int) => (
                    <span key={int} className="flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                      {int}
                      <button onClick={() => dispatch({ type: 'REMOVE_INTEREST', value: int })} className="text-zinc-500 hover:text-zinc-300">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Ad Creative */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Format Selector */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">Ad Format</label>
              <div className="flex gap-3">
                {AD_FORMATS.map(({ value, label }) => {
                  const Icon = FORMAT_ICONS[value] || Image;
                  return (
                    <button
                      key={value}
                      onClick={() => set('adFormat', value)}
                      className={clsx(
                        'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all',
                        state.adFormat === value
                          ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      )}
                    >
                      <Icon size={20} />
                      <span className="text-2xs font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Copy fields */}
              <div className="space-y-4">
                {/* Upload */}
                <div
                  className="drop-zone flex flex-col items-center justify-center rounded-lg py-8 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFileUpload(Array.from(e.dataTransfer.files)); }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files.length) handleFileUpload(Array.from(e.target.files)); }}
                  />
                  <Upload size={24} className="mb-2 text-zinc-500" />
                  <p className="text-xs text-zinc-400">Drag and drop files here</p>
                  <p className="text-2xs text-zinc-600">or click to browse</p>
                  {state.assets.length > 0 && (
                    <p className="mt-2 text-2xs text-emerald-400">{state.assets.length} file(s) uploaded</p>
                  )}
                </div>

                {/* Copy */}
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Primary Text</label>
                  <textarea
                    value={state.primaryText}
                    onChange={(e) => set('primaryText', e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Main ad copy..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-2xs text-zinc-500">Headline</label>
                    <input
                      type="text"
                      value={state.headline}
                      onChange={(e) => set('headline', e.target.value)}
                      className="w-full"
                      placeholder="Ad headline"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-2xs text-zinc-500">Description</label>
                    <input
                      type="text"
                      value={state.description}
                      onChange={(e) => set('description', e.target.value)}
                      className="w-full"
                      placeholder="Link description"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Call to Action</label>
                  <select value={state.cta} onChange={(e) => set('cta', e.target.value)} className="w-48">
                    {CTA_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Destination URL + UTM */}
                <div className="border-t border-zinc-700 pt-4">
                  <label className="mb-1 block text-2xs text-zinc-500">Destination URL</label>
                  <input
                    type="url"
                    value={state.destinationUrl}
                    onChange={(e) => set('destinationUrl', e.target.value)}
                    className="mb-3 w-full"
                    placeholder="https://example.com/landing"
                  />
                  <p className="mb-2 text-2xs font-medium text-zinc-500">UTM Parameters</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-2xs text-zinc-600">utm_source</label>
                      <input type="text" value={state.utmSource} onChange={(e) => set('utmSource', e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-2xs text-zinc-600">utm_medium</label>
                      <input type="text" value={state.utmMedium} onChange={(e) => set('utmMedium', e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-2xs text-zinc-600">utm_campaign</label>
                      <input type="text" value={state.utmCampaign} onChange={(e) => set('utmCampaign', e.target.value)} placeholder={state.name.toLowerCase().replace(/\s+/g, '_') || 'campaign_name'} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-2xs text-zinc-600">utm_content</label>
                      <input type="text" value={state.utmContent} onChange={(e) => set('utmContent', e.target.value)} className="w-full" />
                    </div>
                  </div>
                  {state.destinationUrl && (
                    <div className="mt-2 rounded bg-zinc-900 p-2">
                      <p className="text-2xs text-zinc-500">Full URL Preview:</p>
                      <p className="mt-0.5 break-all text-2xs text-primary-400">{fullUtmUrl}</p>
                    </div>
                  )}
                </div>

                {/* A/B Variants */}
                <div className="border-t border-zinc-700 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-zinc-400">A/B Variants</p>
                    <button
                      onClick={() => dispatch({ type: 'ADD_VARIANT' })}
                      className="flex items-center gap-1 rounded px-2 py-1 text-2xs text-primary-400 hover:bg-zinc-700"
                    >
                      <Plus size={12} /> Add Variant
                    </button>
                  </div>
                  {state.variants.map((variant, i) => (
                    <div key={i} className="mb-3 rounded-lg border border-zinc-700 bg-zinc-900/50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-zinc-300">Variant {String.fromCharCode(66 + i)}</span>
                        <button onClick={() => dispatch({ type: 'REMOVE_VARIANT', index: i })} className="text-zinc-500 hover:text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <textarea
                          value={variant.primaryText}
                          onChange={(e) => dispatch({ type: 'UPDATE_VARIANT', index: i, field: 'primaryText', value: e.target.value })}
                          rows={2} className="w-full" placeholder="Primary text"
                        />
                        <input
                          type="text"
                          value={variant.headline}
                          onChange={(e) => dispatch({ type: 'UPDATE_VARIANT', index: i, field: 'headline', value: e.target.value })}
                          className="w-full" placeholder="Headline"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={variant.description}
                            onChange={(e) => dispatch({ type: 'UPDATE_VARIANT', index: i, field: 'description', value: e.target.value })}
                            className="flex-1" placeholder="Description"
                          />
                          <select
                            value={variant.cta}
                            onChange={(e) => dispatch({ type: 'UPDATE_VARIANT', index: i, field: 'cta', value: e.target.value })}
                            className="w-36"
                          >
                            {CTA_OPTIONS.map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Phone Preview */}
              <div>
                <div className="mb-3 flex gap-1">
                  {[
                    { value: 'fb_feed', label: 'FB Feed' },
                    { value: 'ig_feed', label: 'IG Feed' },
                    { value: 'ig_stories', label: 'IG Stories' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => set('previewMode', value)}
                      className={clsx(
                        'rounded px-3 py-1 text-2xs font-medium transition-colors',
                        state.previewMode === value ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="phone-frame mx-auto">
                  <div className="phone-frame-content">
                    {state.previewMode === 'ig_stories' ? (
                      // Stories preview
                      <div className="flex h-full flex-col bg-black text-white">
                        <div className="flex items-center gap-2 p-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                          <div>
                            <p className="text-xs font-semibold">Your Brand</p>
                            <p className="text-2xs text-zinc-400">Sponsored</p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-center justify-center bg-zinc-800">
                          <div className="text-center">
                            <Image size={32} className="mx-auto mb-2 text-zinc-600" />
                            <p className="text-2xs text-zinc-500">Ad preview</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="mb-2 text-xs">{state.primaryText || 'Your ad text here...'}</p>
                          <div className="rounded bg-zinc-800 p-2 text-center">
                            <p className="text-xs font-semibold">{CTA_OPTIONS.find((c) => c.value === state.cta)?.label || 'Learn More'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Feed preview (FB/IG)
                      <div className="flex h-full flex-col bg-white text-black">
                        <div className="flex items-center gap-2 border-b border-gray-200 p-3">
                          <div className={clsx(
                            'h-8 w-8 rounded-full',
                            state.previewMode === 'ig_feed' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-blue-500'
                          )} />
                          <div>
                            <p className="text-xs font-semibold">Your Brand</p>
                            <p className="text-2xs text-gray-500">Sponsored</p>
                          </div>
                        </div>
                        <p className="px-3 pt-2 text-xs">{state.primaryText || 'Your ad text here...'}</p>
                        <div className="my-2 flex aspect-square items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <Image size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-2xs text-gray-400">Ad creative preview</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 px-3 py-2">
                          <p className="text-2xs text-gray-500">{state.destinationUrl || 'example.com'}</p>
                          <p className="text-xs font-semibold">{state.headline || 'Your Headline'}</p>
                          <p className="text-2xs text-gray-500">{state.description || 'Your description'}</p>
                        </div>
                        <div className="mx-3 mb-3 rounded bg-blue-500 py-2 text-center">
                          <p className="text-xs font-semibold text-white">{CTA_OPTIONS.find((c) => c.value === state.cta)?.label || 'Learn More'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Campaign Summary */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Campaign</h3>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
                <dt className="text-xs text-zinc-500">Name</dt>
                <dd className="text-xs text-zinc-200">{state.name}</dd>
                <dt className="text-xs text-zinc-500">Objective</dt>
                <dd className="text-xs text-zinc-200">{OBJECTIVES.find((o) => o.value === state.objective)?.label || state.objective}</dd>
                <dt className="text-xs text-zinc-500">Buying Type</dt>
                <dd className="text-xs text-zinc-200">{state.buyingType === 'AUCTION' ? 'Auction' : 'Reach & Frequency'}</dd>
                {state.specialAdCategories.length > 0 && (
                  <>
                    <dt className="text-xs text-zinc-500">Special Categories</dt>
                    <dd className="text-xs text-zinc-200">{state.specialAdCategories.join(', ')}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Ad Set Summary */}
            <div className="border-t border-zinc-700 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Ad Set</h3>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
                <dt className="text-xs text-zinc-500">Budget</dt>
                <dd className="text-xs text-zinc-200">${state.budgetAmount} {state.budgetType.toLowerCase()}</dd>
                <dt className="text-xs text-zinc-500">Schedule</dt>
                <dd className="text-xs text-zinc-200">{state.startDate || 'Not set'} - {state.endDate || 'Ongoing'}</dd>
                <dt className="text-xs text-zinc-500">Bid Strategy</dt>
                <dd className="text-xs text-zinc-200">
                  {BID_STRATEGIES.find((b) => b.value === state.bidStrategy)?.label}
                  {state.bidCap && ` ($${state.bidCap})`}
                </dd>
                <dt className="text-xs text-zinc-500">Placements</dt>
                <dd className="text-xs text-zinc-200">
                  {state.placementMode === 'AUTOMATIC' ? 'Advantage+ (All)' : `${state.selectedPlacements.length} selected`}
                </dd>
                <dt className="text-xs text-zinc-500">Optimization</dt>
                <dd className="text-xs text-zinc-200">{OPTIMIZATION_GOALS.find((o) => o.value === state.optimizationGoal)?.label}</dd>
                <dt className="text-xs text-zinc-500">Audience</dt>
                <dd className="text-xs text-zinc-200">
                  Ages {state.ageMin}-{state.ageMax === 65 ? '65+' : state.ageMax},
                  {state.gender === 'ALL' ? ' All Genders' : state.gender === 'MALE' ? ' Men' : ' Women'}
                  {state.locations.length > 0 && `, ${state.locations.join(', ')}`}
                </dd>
                {state.interests.length > 0 && (
                  <>
                    <dt className="text-xs text-zinc-500">Interests</dt>
                    <dd className="text-xs text-zinc-200">{state.interests.join(', ')}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Ad Summary */}
            <div className="border-t border-zinc-700 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Ad Creative</h3>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
                <dt className="text-xs text-zinc-500">Format</dt>
                <dd className="text-xs text-zinc-200">{AD_FORMATS.find((f) => f.value === state.adFormat)?.label}</dd>
                <dt className="text-xs text-zinc-500">Headline</dt>
                <dd className="text-xs text-zinc-200">{state.headline || '--'}</dd>
                <dt className="text-xs text-zinc-500">Primary Text</dt>
                <dd className="text-xs text-zinc-200">{state.primaryText || '--'}</dd>
                <dt className="text-xs text-zinc-500">CTA</dt>
                <dd className="text-xs text-zinc-200">{CTA_OPTIONS.find((c) => c.value === state.cta)?.label}</dd>
                <dt className="text-xs text-zinc-500">Destination</dt>
                <dd className="break-all text-xs text-primary-400">{fullUtmUrl || '--'}</dd>
                {state.variants.length > 0 && (
                  <>
                    <dt className="text-xs text-zinc-500">Variants</dt>
                    <dd className="text-xs text-zinc-200">{state.variants.length} A/B variant{state.variants.length > 1 ? 's' : ''}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Estimated Reach */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-center">
              <p className="text-2xs font-medium uppercase tracking-wide text-zinc-500">Estimated Daily Reach</p>
              <p className="mt-1 text-lg font-bold text-zinc-100">2,400 - 6,800</p>
              <p className="text-2xs text-zinc-500">Based on your targeting and budget</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/campaigns')}
          className="flex items-center gap-1 rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft size={14} /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <div className="flex gap-2">
          {step === 3 && (
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit to Meta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
