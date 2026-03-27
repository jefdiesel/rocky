import { useState, useReducer, useCallback, useRef } from 'react';
import {
  Sparkles, FileText, PenTool, Layout, Layers, Plus, X, Copy, Check,
  ChevronRight, ChevronDown, Trash2, GripVertical, Clock, Video,
  Image, Type, MoveUp, MoveDown, Download, RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import {
  HOOK_FRAMEWORKS, AD_TEMPLATES, CTA_STYLES, TEXT_OVERLAY_STYLES,
} from '../utils/creativeStudioData.js';
import PageGuide from '../components/common/PageGuide.jsx';

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: HOOK GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function HookGenerator() {
  const [product, setProduct] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [audience, setAudience] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [generatedHooks, setGeneratedHooks] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const toggleFramework = (id) => {
    setSelectedFrameworks((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const generateHooks = () => {
    const frameworks = selectedFrameworks.length > 0
      ? HOOK_FRAMEWORKS.filter((f) => selectedFrameworks.includes(f.id))
      : HOOK_FRAMEWORKS;

    const hooks = [];
    for (const fw of frameworks) {
      // Generate variations based on user input
      const base = fw.template
        .replace('{product_benefit}', product || 'this amazing product')
        .replace('{product_type}', product || 'product')
        .replace('{pain_point}', painPoint || 'this common problem')
        .replace('{contrarian_take}', painPoint ? `you don't need to deal with ${painPoint}` : 'most people do this wrong')
        .replace('{activity}', painPoint || 'this')
        .replace('{personal_story}', product ? `I discovered ${product}` : 'I found the solution')
        .replace('{value_prop}', product ? `you need ${product}` : 'you need this')
        .replace('{content_description}', product ? `viral ${product} reviews` : 'these viral products')
        .replace('{product_category}', product || 'this category')
        .replace('{competitor_category}', product ? `bad ${product} alternatives` : 'things that don\'t work')
        .replace('{topic}', product || 'this')
        .replace('{product}', product || 'product')
        .replace('{action}', product ? `use ${product}` : 'try this');

      hooks.push({
        framework: fw.name,
        frameworkId: fw.id,
        hook: base,
        variations: [
          base,
          ...fw.examples.map((ex) =>
            ex.replace(/skincare|product|routine/gi, product || '$&')
          ).slice(0, 2),
        ],
      });
    }
    setGeneratedHooks(hooks);
  };

  const copyHook = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Your Product Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Product / Brand</label>
            <input type="text" value={product} onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g., Hydrating face serum" className="w-full" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Pain Point</label>
            <input type="text" value={painPoint} onChange={(e) => setPainPoint(e.target.value)}
              placeholder="e.g., dry flaky skin" className="w-full" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Target Audience</label>
            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Women 18-34" className="w-full" />
          </div>
        </div>
      </div>

      {/* Framework Selection */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">Hook Frameworks</h3>
        <p className="mb-3 text-2xs text-zinc-500">Select specific frameworks or leave empty for all</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {HOOK_FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              onClick={() => toggleFramework(fw.id)}
              className={clsx(
                'rounded-lg border p-3 text-left transition-all',
                selectedFrameworks.includes(fw.id)
                  ? 'border-primary-500 bg-primary-600/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
              )}
            >
              <p className="text-xs font-semibold text-zinc-200">{fw.name}</p>
              <p className="mt-0.5 text-2xs text-zinc-500 line-clamp-2">{fw.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateHooks}
        className="flex items-center gap-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        <Sparkles size={16} /> Generate Hooks
      </button>

      {/* Generated Hooks */}
      {generatedHooks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">Generated Hooks ({generatedHooks.length * 3} variations)</h3>
          {generatedHooks.map((group, gi) => (
            <div key={gi} className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-primary-600/20 px-2 py-0.5 text-2xs font-medium text-primary-400">{group.framework}</span>
              </div>
              <div className="space-y-2">
                {group.variations.map((hook, hi) => {
                  const idx = `${gi}-${hi}`;
                  return (
                    <div key={hi} className="flex items-start gap-2 group">
                      <p className="flex-1 text-xs text-zinc-300 leading-relaxed">"{hook}"</p>
                      <button
                        onClick={() => copyHook(hook, idx)}
                        className="flex-shrink-0 rounded p-1 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedIdx === idx ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: SCRIPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function ScriptBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [projectName, setProjectName] = useState('');

  const loadTemplate = (template) => {
    setSelectedTemplate(template);
    setScenes(template.scenes.map((s, i) => ({
      ...s,
      id: `scene_${i}`,
      userVisual: '',
      userAudio: '',
      userNote: '',
    })));
    if (!projectName) setProjectName(`${template.name} Ad`);
  };

  const updateScene = (idx, field, value) => {
    setScenes((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addScene = () => {
    setScenes((prev) => [...prev, {
      id: `scene_${Date.now()}`,
      time: '',
      type: 'custom',
      visual: '',
      audio: '',
      note: '',
      userVisual: '',
      userAudio: '',
      userNote: '',
    }]);
  };

  const removeScene = (idx) => {
    setScenes((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveScene = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= scenes.length) return;
    setScenes((prev) => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const exportScript = () => {
    let text = `# ${projectName || 'Ad Script'}\n`;
    if (selectedTemplate) text += `Template: ${selectedTemplate.name} | Duration: ${selectedTemplate.duration}\n`;
    text += `\n---\n\n`;
    scenes.forEach((s, i) => {
      text += `## Scene ${i + 1} ${s.time ? `[${s.time}]` : ''} — ${s.type.toUpperCase()}\n`;
      text += `Visual: ${s.userVisual || s.visual || '(not set)'}\n`;
      text += `Audio: ${s.userAudio || s.audio || '(not set)'}\n`;
      if (s.userNote || s.note) text += `Note: ${s.userNote || s.note}\n`;
      text += `\n`;
    });
    navigator.clipboard.writeText(text);
    alert('Script copied to clipboard!');
  };

  const typeColors = {
    hook: 'border-red-500/40 bg-red-500/5',
    problem: 'border-amber-500/40 bg-amber-500/5',
    solution: 'border-emerald-500/40 bg-emerald-500/5',
    demo: 'border-blue-500/40 bg-blue-500/5',
    proof: 'border-purple-500/40 bg-purple-500/5',
    result: 'border-emerald-500/40 bg-emerald-500/5',
    cta: 'border-pink-500/40 bg-pink-500/5',
    transition: 'border-zinc-500/40 bg-zinc-500/5',
    before: 'border-amber-500/40 bg-amber-500/5',
    after: 'border-emerald-500/40 bg-emerald-500/5',
    process: 'border-blue-500/40 bg-blue-500/5',
    unbox: 'border-purple-500/40 bg-purple-500/5',
    reveal: 'border-pink-500/40 bg-pink-500/5',
    use: 'border-blue-500/40 bg-blue-500/5',
    content: 'border-zinc-500/40 bg-zinc-500/5',
    custom: 'border-zinc-500/40 bg-zinc-500/5',
    point_1: 'border-blue-500/40 bg-blue-500/5',
    point_2: 'border-purple-500/40 bg-purple-500/5',
    point_3: 'border-pink-500/40 bg-pink-500/5',
  };

  return (
    <div className="space-y-6">
      {/* Template Picker */}
      {!selectedTemplate && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-200">Choose a Template</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AD_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => loadTemplate(tpl)}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 text-left hover:border-zinc-600 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-zinc-200">{tpl.name}</h4>
                  <span className="flex items-center gap-1 text-2xs text-zinc-500">
                    <Clock size={10} /> {tpl.duration}
                  </span>
                </div>
                <p className="text-2xs text-zinc-400 mb-2">{tpl.description}</p>
                <div className="flex flex-wrap gap-1">
                  {tpl.bestFor.map((tag) => (
                    <span key={tag} className="rounded bg-zinc-700 px-1.5 py-0.5 text-2xs text-zinc-400">{tag}</span>
                  ))}
                </div>
                <p className="mt-2 text-2xs text-zinc-600">{tpl.scenes.length} scenes · {tpl.difficulty}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => { setSelectedTemplate({ name: 'Custom', scenes: [] }); setScenes([]); }}
              className="text-xs text-primary-400 hover:text-primary-300">
              Or start from scratch
            </button>
          </div>
        </div>
      )}

      {/* Script Editor */}
      {selectedTemplate && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedTemplate(null); setScenes([]); }}
                className="text-xs text-zinc-500 hover:text-zinc-300">&larr; Templates</button>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent text-sm font-semibold text-zinc-100 border-none outline-none" placeholder="Project name" />
            </div>
            <div className="flex gap-2">
              <button onClick={addScene} className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800">
                <Plus size={13} /> Add Scene
              </button>
              <button onClick={exportScript} className="flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
                <Copy size={13} /> Export Script
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {scenes.map((scene, idx) => (
              <div key={scene.id} className={clsx('rounded-lg border p-4', typeColors[scene.type] || typeColors.custom)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">Scene {idx + 1}</span>
                    {scene.time && <span className="rounded bg-zinc-700/50 px-2 py-0.5 text-2xs text-zinc-400">{scene.time}</span>}
                    <span className="rounded bg-zinc-700/50 px-2 py-0.5 text-2xs font-medium text-zinc-300 uppercase">{scene.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveScene(idx, -1)} className="rounded p-1 text-zinc-600 hover:text-zinc-300"><MoveUp size={13} /></button>
                    <button onClick={() => moveScene(idx, 1)} className="rounded p-1 text-zinc-600 hover:text-zinc-300"><MoveDown size={13} /></button>
                    <button onClick={() => removeScene(idx)} className="rounded p-1 text-zinc-600 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>

                {/* Template guidance */}
                {(scene.visual || scene.audio || scene.note) && (
                  <div className="mb-3 rounded bg-zinc-900/50 p-2.5 text-2xs text-zinc-500 space-y-1">
                    {scene.visual && <p><span className="text-zinc-400 font-medium">Visual:</span> {scene.visual}</p>}
                    {scene.audio && <p><span className="text-zinc-400 font-medium">Audio:</span> {scene.audio}</p>}
                    {scene.note && <p><span className="text-zinc-400 font-medium">Tip:</span> {scene.note}</p>}
                  </div>
                )}

                {/* User inputs */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-2xs text-zinc-500">Your Visual Direction</label>
                    <textarea value={scene.userVisual} onChange={(e) => updateScene(idx, 'userVisual', e.target.value)}
                      rows={2} className="w-full text-xs" placeholder="Describe the visual..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-2xs text-zinc-500">Your Script / Audio</label>
                    <textarea value={scene.userAudio} onChange={(e) => updateScene(idx, 'userAudio', e.target.value)}
                      rows={2} className="w-full text-xs" placeholder="What is said..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: COPY LAB
// ═══════════════════════════════════════════════════════════════════════════════

function CopyLab() {
  const [variants, setVariants] = useState([
    { id: 1, primaryText: '', headline: '', cta: '', notes: '' },
  ]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const addVariant = () => {
    setVariants((prev) => [...prev, {
      id: Date.now(),
      primaryText: '',
      headline: '',
      cta: '',
      notes: '',
    }]);
  };

  const updateVariant = (id, field, value) => {
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariant = (id) => {
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const duplicateVariant = (variant) => {
    setVariants((prev) => [...prev, { ...variant, id: Date.now() }]);
  };

  const copyAll = () => {
    const text = variants.map((v, i) => (
      `Variant ${String.fromCharCode(65 + i)}:\n` +
      `Primary: ${v.primaryText}\n` +
      `Headline: ${v.headline}\n` +
      `CTA: ${v.cta}\n` +
      (v.notes ? `Notes: ${v.notes}\n` : '')
    )).join('\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopiedIdx('all');
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Ad Copy Variants</h3>
          <p className="text-2xs text-zinc-500">Create multiple variations for A/B testing</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyAll}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800">
            {copiedIdx === 'all' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copiedIdx === 'all' ? 'Copied' : 'Copy All'}
          </button>
          <button onClick={addVariant}
            className="flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
            <Plus size={13} /> Add Variant
          </button>
        </div>
      </div>

      {/* CTA Inspiration */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
        <p className="mb-2 text-xs font-medium text-zinc-300">CTA Inspiration</p>
        <div className="flex flex-wrap gap-2">
          {CTA_STYLES.map((style) => (
            <div key={style.id} className="group relative">
              <span className="rounded bg-zinc-700 px-2 py-1 text-2xs text-zinc-400 cursor-help">{style.name}</span>
              <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 w-48 rounded-lg border border-zinc-600 bg-zinc-800 p-2 shadow-xl">
                {style.examples.map((ex, i) => (
                  <p key={i} className="text-2xs text-zinc-300 py-0.5">"{ex}"</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        {variants.map((variant, idx) => (
          <div key={variant.id} className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-200">Variant {String.fromCharCode(65 + idx)}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => duplicateVariant(variant)} className="rounded p-1 text-zinc-600 hover:text-zinc-300" title="Duplicate"><Copy size={13} /></button>
                {variants.length > 1 && (
                  <button onClick={() => removeVariant(variant.id)} className="rounded p-1 text-zinc-600 hover:text-red-400" title="Remove"><Trash2 size={13} /></button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-2xs text-zinc-500">Primary Text / Ad Copy</label>
                <textarea value={variant.primaryText} onChange={(e) => updateVariant(variant.id, 'primaryText', e.target.value)}
                  rows={3} className="w-full text-xs" placeholder="Main ad copy — this is what appears above the video" />
                <p className="mt-0.5 text-right text-2xs text-zinc-600">{variant.primaryText.length} chars</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">Headline / Display Name</label>
                  <input type="text" value={variant.headline} onChange={(e) => updateVariant(variant.id, 'headline', e.target.value)}
                    className="w-full text-xs" placeholder="Brand or headline text" />
                </div>
                <div>
                  <label className="mb-1 block text-2xs text-zinc-500">CTA Text</label>
                  <input type="text" value={variant.cta} onChange={(e) => updateVariant(variant.id, 'cta', e.target.value)}
                    className="w-full text-xs" placeholder="e.g., Shop Now — 20% off with code TIKTOK" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-2xs text-zinc-500">Notes / Hypothesis</label>
                <input type="text" value={variant.notes} onChange={(e) => updateVariant(variant.id, 'notes', e.target.value)}
                  className="w-full text-xs" placeholder="Why this variant? What are you testing?" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: VISUAL COMPOSER
// ═══════════════════════════════════════════════════════════════════════════════

function VisualComposer() {
  const [layers, setLayers] = useState([]);
  const [bgColor, setBgColor] = useState('#000000');
  const [bgImage, setBgImage] = useState(null);
  const fileRef = useRef(null);

  const addTextLayer = () => {
    setLayers((prev) => [...prev, {
      id: Date.now(),
      type: 'text',
      content: 'Your text here',
      style: 'bold_white',
      x: 50,
      y: 50,
      size: 'lg',
    }]);
  };

  const addCtaLayer = () => {
    setLayers((prev) => [...prev, {
      id: Date.now(),
      type: 'cta',
      content: 'Shop Now',
      style: 'gradient',
      x: 50,
      y: 85,
      size: 'md',
    }]);
  };

  const updateLayer = (id, field, value) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLayer = (id) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImage(url);
  };

  const sizeClasses = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-[14px]',
    xl: 'text-[18px]',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Controls */}
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
            <h4 className="mb-3 text-xs font-semibold text-zinc-200">Canvas</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800">
                <Image size={13} /> Upload Background
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleBgUpload} />
              <div className="flex items-center gap-2">
                <label className="text-2xs text-zinc-500">BG Color:</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded border border-zinc-700" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={addTextLayer}
                className="flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
                <Type size={13} /> Add Text
              </button>
              <button onClick={addCtaLayer}
                className="flex items-center gap-1 rounded-md border border-pink-500/50 px-3 py-1.5 text-xs text-pink-400 hover:bg-pink-500/10">
                <Plus size={13} /> Add CTA Button
              </button>
            </div>
          </div>

          {/* Layer Controls */}
          {layers.map((layer, idx) => (
            <div key={layer.id} className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-200">
                  {layer.type === 'cta' ? 'CTA Button' : 'Text Layer'} {idx + 1}
                </span>
                <button onClick={() => removeLayer(layer.id)} className="rounded p-1 text-zinc-600 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
              <div className="space-y-2">
                <input type="text" value={layer.content} onChange={(e) => updateLayer(layer.id, 'content', e.target.value)}
                  className="w-full text-xs" placeholder="Text content" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-2xs text-zinc-500 mb-1">Style</label>
                    <select value={layer.style} onChange={(e) => updateLayer(layer.id, 'style', e.target.value)} className="w-full text-xs">
                      {TEXT_OVERLAY_STYLES.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs text-zinc-500 mb-1">Size</label>
                    <select value={layer.size} onChange={(e) => updateLayer(layer.id, 'size', e.target.value)} className="w-full text-xs">
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-2xs text-zinc-500 mb-1">X Position (%)</label>
                    <input type="range" min="0" max="100" value={layer.x}
                      onChange={(e) => updateLayer(layer.id, 'x', Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-2xs text-zinc-500 mb-1">Y Position (%)</label>
                    <input type="range" min="0" max="100" value={layer.y}
                      onChange={(e) => updateLayer(layer.id, 'y', Number(e.target.value))} className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: 9:16 Preview */}
        <div>
          <h4 className="mb-3 text-xs font-semibold text-zinc-200">Preview (9:16)</h4>
          <div className="phone-frame mx-auto">
            <div className="phone-frame-content relative overflow-hidden" style={{ backgroundColor: bgColor }}>
              {bgImage && (
                <img src={bgImage} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
              )}
              {/* TikTok UI overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <p className="text-2xs text-white/60 font-medium">Following | For You</p>
              </div>
              {/* Text layers */}
              {layers.map((layer) => {
                const styleObj = TEXT_OVERLAY_STYLES.find((s) => s.id === layer.style);
                return (
                  <div
                    key={layer.id}
                    className="absolute z-20"
                    style={{
                      left: `${Math.min(layer.x, 90)}%`,
                      top: `${Math.min(layer.y, 95)}%`,
                      transform: 'translate(-50%, -50%)',
                      maxWidth: '90%',
                    }}
                  >
                    <span className={clsx(sizeClasses[layer.size], styleObj?.preview)}>
                      {layer.content}
                    </span>
                  </div>
                );
              })}
              {/* Bottom TikTok UI */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-10">
                <p className="text-[10px] font-semibold text-white">@yourbrand</p>
                <p className="text-[8px] text-white/80 mt-0.5">Ad caption goes here #fyp #ad</p>
              </div>
              {/* Right side TikTok icons */}
              <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 z-10">
                {['❤️', '💬', '↗️', '🔖'].map((icon, i) => (
                  <div key={i} className="text-center">
                    <span className="text-sm">{icon}</span>
                    <p className="text-[7px] text-white/60">{['24.5K', '1.2K', '3.4K', '892'][i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

function Templates() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-zinc-200">Ad Templates</h3>
        <p className="mb-4 text-2xs text-zinc-500">Proven ad structures with scene-by-scene breakdowns. Click to expand.</p>
      </div>

      <div className="space-y-3">
        {AD_TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-zinc-700/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600/15">
                  <Video size={18} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">{tpl.name}</h4>
                  <p className="text-2xs text-zinc-500">{tpl.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="flex items-center gap-1 text-2xs text-zinc-500"><Clock size={10} />{tpl.duration}</span>
                  <span className="text-2xs text-zinc-600">·</span>
                  <span className="text-2xs text-zinc-500">{tpl.scenes.length} scenes</span>
                  <span className="text-2xs text-zinc-600">·</span>
                  <span className="text-2xs text-zinc-500">{tpl.difficulty}</span>
                </div>
                {expandedId === tpl.id ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
              </div>
            </button>

            {expandedId === tpl.id && (
              <div className="border-t border-zinc-700/50 p-4">
                <div className="flex flex-wrap gap-1 mb-4">
                  {tpl.bestFor.map((tag) => (
                    <span key={tag} className="rounded bg-primary-600/15 px-2 py-0.5 text-2xs font-medium text-primary-400">{tag}</span>
                  ))}
                </div>

                <div className="space-y-0">
                  {tpl.scenes.map((scene, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 relative">
                      {/* Timeline line */}
                      {idx < tpl.scenes.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-700" />
                      )}
                      {/* Scene dot */}
                      <div className="flex-shrink-0 mt-1">
                        <div className={clsx(
                          'h-[30px] w-[30px] rounded-full flex items-center justify-center text-2xs font-bold',
                          scene.type === 'hook' ? 'bg-red-500/20 text-red-400' :
                          scene.type === 'cta' ? 'bg-pink-500/20 text-pink-400' :
                          scene.type === 'proof' || scene.type === 'result' || scene.type === 'after' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-zinc-700 text-zinc-400'
                        )}>
                          {idx + 1}
                        </div>
                      </div>
                      {/* Scene content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-zinc-200 uppercase">{scene.type}</span>
                          <span className="text-2xs text-zinc-500">{scene.time}</span>
                        </div>
                        <div className="rounded bg-zinc-900/50 p-3 space-y-1.5">
                          <p className="text-2xs text-zinc-300"><span className="text-zinc-500 font-medium">Visual:</span> {scene.visual}</p>
                          <p className="text-2xs text-zinc-300"><span className="text-zinc-500 font-medium">Audio:</span> {scene.audio}</p>
                          {scene.note && <p className="text-2xs text-amber-400/80"><span className="text-amber-400/60 font-medium">Pro tip:</span> {scene.note}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN: CREATIVE STUDIO
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'hooks', label: 'Hook Generator', icon: Sparkles },
  { id: 'script', label: 'Script Builder', icon: FileText },
  { id: 'copy', label: 'Copy Lab', icon: PenTool },
  { id: 'visual', label: 'Visual Composer', icon: Layout },
  { id: 'templates', label: 'Templates', icon: Layers },
];

export default function CreativeStudio() {
  const [activeTab, setActiveTab] = useState('hooks');

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="creative-studio"
        title="Creative Studio"
        tips={[
          'Use the Hook Generator to create scroll-stopping opening lines',
          'Script Builder gives you shot-by-shot storyboards from proven templates',
          'Copy Lab helps you create A/B test variants for your ad text',
          'Visual Composer lets you design text overlays in a 9:16 preview',
          'Templates break down proven ad structures scene by scene',
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Creative Studio</h1>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 pb-px">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-1.5 whitespace-nowrap rounded-t-md px-3 py-2 text-xs font-medium transition-colors',
              activeTab === id
                ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-600/5'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'hooks' && <HookGenerator />}
        {activeTab === 'script' && <ScriptBuilder />}
        {activeTab === 'copy' && <CopyLab />}
        {activeTab === 'visual' && <VisualComposer />}
        {activeTab === 'templates' && <Templates />}
      </div>
    </div>
  );
}
