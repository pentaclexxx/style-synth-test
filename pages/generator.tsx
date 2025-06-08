import { useState } from 'react';

export default function GeneratorPage() {
  const [mode, setMode] = useState<'guided' | 'open'>('guided');
  const [garment, setGarment] = useState('');
  const [style, setStyle] = useState('');
  const [colors, setColors] = useState('');
  const [season, setSeason] = useState('');
  const [silhouette, setSilhouette] = useState('');
  const [mood, setMood] = useState('');
  const [openPrompt, setOpenPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    let prompt = '';

    if (mode === 'guided') {
      if ([garment, style, colors, season, silhouette, mood].some(v => !v)) {
        alert('Please complete all guided prompt fields.');
        return;
      }
      prompt = `${mood}, ${style} ${garment} with a ${silhouette} silhouette, in ${colors}, for ${season}.`;
    } else {
      if (!openPrompt.trim()) {
        alert('Please enter a prompt.');
        return;
      }
      prompt = openPrompt.trim();
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate');
      }

      const data = await response.json();

      if (!data.image) {
        throw new Error('No image returned from backend');
      }

      setImageUrl(data.image);
      setPromptUsed(prompt);
    } catch (err) {
      alert('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    {
      label: 'Garment Type',
      value: garment,
      onChange: setGarment,
      options: ['Dress', 'Jacket', 'Jeans', 'Skirt', 'Suit', 'Hoodie'],
      id: 'garment',
    },
    {
      label: 'Style',
      value: style,
      onChange: setStyle,
      options: ['Minimalist', 'Streetwear', 'Heritage Revival', 'Avant-garde', 'Cyberpunk', 'Bohemian'],
      id: 'style',
    },
    {
      label: 'Colors',
      value: colors,
      onChange: setColors,
      options: ['Monochrome', 'Earth tones', 'Pastels', 'Bold Colors', 'Metallic'],
      id: 'colors',
    },
    {
      label: 'Season',
      value: season,
      onChange: setSeason,
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
      id: 'season',
    },
    {
      label: 'Silhouette',
      value: silhouette,
      onChange: setSilhouette,
      options: ['Fitted', 'Oversized', 'Layered', 'Draped', 'Structured'],
      id: 'silhouette',
    },
    {
      label: 'Mood',
      value: mood,
      onChange: setMood,
      options: ['Bold', 'Romantic', 'Mysterious', 'Rebellious', 'Melancholic'],
      id: 'mood',
    },
  ];

  return (
    <main className="min-h-screen px-4 py-10 text-gray-900">
      <h1 className="text-3xl font-bold text-center mb-10">Generate with Style Synth</h1>

      {/* Responsive, animated toggle tabs */}
      <div className="flex flex-col sm:flex-row justify-start gap-2 max-w-5xl mx-auto -mb-px transition-all duration-300">
        <button
          type="button"
          onClick={() => setMode('guided')}
          aria-pressed={mode === 'guided'}
          className={`px-4 py-2 border rounded-t-md transition-colors duration-300 ${
            mode === 'guided'
              ? 'bg-black text-white border-b-transparent'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
          }`}
        >
          Guided Prompt →
        </button>
        <button
          type="button"
          onClick={() => setMode('open')}
          aria-pressed={mode === 'open'}
          className={`px-4 py-2 border rounded-t-md transition-colors duration-300 ${
            mode === 'open'
              ? 'bg-black text-white border-b-transparent'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
          }`}
        >
          Open Prompt →
        </button>
      </div>

      {/* Form card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="max-w-5xl mx-auto border border-t-0 p-6 shadow rounded-b-md bg-white transition-all"
      >
        {mode === 'guided' ? (
          <div className="grid md:grid-cols-6 gap-4">
            {categories.map(({ label, value, onChange, options, id }) => (
              <div
                key={id}
                className="flex flex-col hover:bg-gray-50 rounded-md transition"
              >
                <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
                <select
                  id={id}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select an option</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : (
          <textarea
            name="prompt"
            aria-label="Prompt text area"
            className="w-full border rounded p-4 h-40 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your prompt here"
            value={openPrompt}
            onChange={e => setOpenPrompt(e.target.value)}
          />
        )}

        <div className="text-center mt-10">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900 disabled:opacity-50 transition"
          >
            {isLoading ? 'Generating...' : 'Generate Design →'}
          </button>
        </div>
      </form>

      {/* Output image */}
      <div className="w-full max-w-6xl h-[400px] mx-auto border border-dashed bg-gray-50 rounded-md flex items-center justify-center text-gray-500 mt-10">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated design"
            className="max-h-full mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/fallback.png';
            }}
          />
        ) : (
          <p>Design will appear here...</p>
        )}
      </div>

      {promptUsed && (
        <p className="text-xs text-center italic mt-2 text-gray-400">
          Prompt: {promptUsed}
        </p>
      )}

      {/* Footer */}
      <div className="text-center mt-10">
        <p className="font-semibold text-lg mb-2">All done?</p>
        <a
          href="/reflect"
          className="inline-block bg-black text-white px-6 py-2 rounded-full"
        >
          Reflect on who created this →
        </a>
      </div>
    </main>
  );
}
