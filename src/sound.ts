// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error jsfxr has no type declarations
import { jsfxr as jsfxrModule } from "jsfxr";
const { sfxr, Params } = jsfxrModule;

const ERROR_PARAMS = [
  {
    oldParams: true,
    wave_type: 3,
    p_env_attack: 0,
    p_env_sustain: 0.07656686796335588,
    p_env_punch: 0,
    p_env_decay: 0.28971060329885634,
    p_base_freq: 0.756995061427642,
    p_freq_limit: 0,
    p_freq_ramp: -0.6452945329393404,
    p_freq_dramp: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0.25063125409516407,
    p_hpf_ramp: 0,
    sound_vol: 0.25,
    sample_rate: 44100,
    sample_size: 8,
  },
  {
    oldParams: true,
    wave_type: 3,
    p_env_attack: 0,
    p_env_sustain: 0.0937410361753156,
    p_env_punch: 0,
    p_env_decay: 0.26212502809232396,
    p_base_freq: 0.5985397916842108,
    p_freq_limit: 0,
    p_freq_ramp: -0.5353071332448576,
    p_freq_dramp: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0.025142002471545043,
    p_hpf_ramp: 0,
    sound_vol: 0.25,
    sample_rate: 44100,
    sample_size: 8,
  },
  {
    oldParams: true,
    wave_type: 1,
    p_env_attack: 0,
    p_env_sustain: 0.01650308490788278,
    p_env_punch: 0,
    p_env_decay: 0.2748046982262259,
    p_base_freq: 0.21768906146793093,
    p_freq_limit: 0,
    p_freq_ramp: -0.3427456586925169,
    p_freq_dramp: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 1,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.25,
    sample_rate: 44100,
    sample_size: 8,
  },
];

let ctx: AudioContext | null = null;
let errorBuffers: AudioBuffer[] = [];
let loadPromise: Promise<void> | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

async function paramsToBuffer(
  ac: AudioContext,
  paramData: object,
): Promise<AudioBuffer> {
  const p = new Params();
  p.fromJSON(paramData);
  const wave = sfxr.toWave(p);
  const base64 = wave.dataURI.slice(wave.dataURI.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return ac.decodeAudioData(bytes.buffer.slice(0));
}

export function initSounds(): void {
  if (loadPromise) return;
  const ac = getCtx();
  loadPromise = Promise.all(
    ERROR_PARAMS.map((p) => paramsToBuffer(ac, p)),
  ).then((buffers) => {
    errorBuffers = buffers;
  });
}

export function playError(): void {
  if (!errorBuffers.length) return;
  const ac = getCtx();
  if (ac.state === "suspended") ac.resume();
  const src = ac.createBufferSource();
  src.buffer = errorBuffers[Math.floor(Math.random() * errorBuffers.length)];
  src.connect(ac.destination);
  src.start();
}
