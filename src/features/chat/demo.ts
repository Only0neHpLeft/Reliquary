import type { Conversation } from "./store";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const now = Date.now();

function mk(
  id: string,
  title: string,
  ageMs: number,
  exchanges: ReadonlyArray<readonly [string, string]>,
): Conversation {
  const start = now - ageMs;
  const messages = exchanges.flatMap(([userText, assistantText], i) => {
    const t = start + i * 60_000;
    return [
      { id: `${id}-u${i}`, role: "user" as const, content: userText, createdAt: t },
      { id: `${id}-a${i}`, role: "assistant" as const, content: assistantText, createdAt: t + 1000 },
    ];
  });
  return {
    id,
    title,
    createdAt: start,
    messages,
  };
}

export const DEMO_CONVERSATIONS: readonly Conversation[] = [
  mk(
    "demo-aperture-r",
    "Aperture's neuromorphic R metric",
    5 * MIN,
    [
      [
        "How does Aperture's neuromorphic R ratio actually work? I keep seeing references to it in the architecture notes.",
        "R is the neuromorphic efficiency ratio — effective capacity from bio-constraints (memristive, STDP, spiking, plasticity, E/I, H-Neurons) divided by the vanilla baseline at matched parameter count. The pre-registered Phase 2 gate is R ≥ 0.5: if six biology-shaped features collectively buy at least half the capacity that raw parameters would, we keep going. If not, we ship the negative result — that's still publishable.",
      ],
      [
        "And what's the L8+3-pair ablation about?",
        "Eight target features times three matched pairs (with vs without each feature, holding everything else fixed) gives 24 controlled comparisons. It isolates which biological constraint contributes capacity vs which is decorative. Synchronized curriculum + same seed across V50/N50/V100 means the only signal in the delta is the feature itself.",
      ],
    ],
  ),
  mk(
    "demo-gu-pack",
    "Minecraft pixel-art texture pack plan",
    2 * HOUR,
    [
      [
        "I want to make a Minecraft texture pack with the Gu model. What's the actual pipeline going to look like?",
        "Pipeline: collect CC-licensed packs from Modrinth/Curseforge/Planet Minecraft, derive labels from filenames (block_oak_log → oak_log block), tokenize textures into a 256-color palette, train a categorical autoregressive transformer with learned 2D positional embeddings (~5–10M params, Flash Attention 2). Inference samples a 16×16 grid of palette tokens; circular shift gives tileability for free at training time.",
      ],
      [
        "Why categorical AR over diffusion?",
        "Pixel art is discrete by definition — palette indices, hard edges, no gradients. Continuous diffusion fights the medium: you'd quantize at the end and lose detail. Categorical AR matches the data: each pixel is a token, the model directly samples the right palette index, and beam search or temperature sampling gives controllable variants. Smaller model, sharper output, no decoder mismatch.",
      ],
      [
        "Cost ballpark for training?",
        "Under $200 on H100, likely under $100. Corpus is small (maybe 100k textures), model is small (~10M params), and 16×16 sequences are 256 tokens — compute is trivial compared to language models. You're paying for data quality and palette design, not flops.",
      ],
    ],
  ),
  mk(
    "demo-dantian-vs-sd",
    "Dantian vs Stable Diffusion architecturally",
    DAY + 4 * HOUR,
    [
      [
        "How does Dantian differ from Stable Diffusion under the hood?",
        "Dantian is continuous flow matching (CFM) — it learns a vector field that maps noise to data along straight-ish paths, instead of SD's score-based denoising along a fixed forward SDE. CFM trains by matching velocity at sampled time steps, which is simpler and converges faster. At inference you integrate an ODE — fewer, larger steps than SD's iterative denoiser. The architecture itself can be DiT-style (transformer over patches), Diffusion U-Net, or hybrid; the difference is the objective and the sampler, not the network.",
      ],
      [
        "Why CFM as the first commercial target?",
        "Image is the highest-revenue consumer surface (Midjourney scale), CFM trains cheaper than score-based for comparable quality, and the inference compute is lower so per-image margins are healthier. Plus the eval is visual — you can demo it. Aperture text is the hard research bet; Dantian is the one that pays the bills while research finishes.",
      ],
    ],
  ),
  mk(
    "demo-refactor",
    "Refactor a React useFetch hook",
    3 * DAY,
    [
      [
        "Can you refactor this hook to handle abort + race conditions?\n\nfunction useFetch(url) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(url).then(r => r.json()).then(setData);\n  }, [url]);\n  return data;\n}",
        "Two issues: stale responses overwriting fresh ones when `url` changes mid-flight, and unmount setting state. Fix with AbortController + a mounted flag:\n\nfunction useFetch(url) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    const ctrl = new AbortController();\n    fetch(url, { signal: ctrl.signal })\n      .then(r => r.json())\n      .then(d => setData(d))\n      .catch(e => { if (e.name !== 'AbortError') throw e; });\n    return () => ctrl.abort();\n  }, [url]);\n  return data;\n}\n\nThe abort cancels the in-flight request when `url` changes or the component unmounts. The catch swallows AbortError specifically — anything else still surfaces.",
      ],
    ],
  ),
  mk(
    "demo-sourdough",
    "Sourdough hydration question",
    7 * DAY,
    [
      [
        "What's a good starter hydration ratio for a beginner? My current loaf is too dense.",
        "Density usually isn't hydration — it's underfermented dough or weak gluten development. Start with 75% hydration (375g water per 500g flour). The fix for dense crumb is more bulk fermentation time (let it rise until it's grown ~75% in volume, not just doubled), and a proper coil fold every 30 min for the first 2 hours to build structure. If your starter is sluggish, feed twice before baking — peak activity 4–6h after feed.",
      ],
    ],
  ),
];
