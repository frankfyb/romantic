export type TimeCapsuleConfig = {
  recipient: string;
  message: string;
  themeColor: 'indigo' | 'rose' | 'amber' | 'emerald';
  bgStyle: 'gradient-space' | 'gradient-sunset' | 'gradient-ocean';
  openDate: string;
  musicUrl?: string;
};

export const defaultConfig: TimeCapsuleConfig = {
  recipient: '亲爱的',
  message: '写下此刻想说的话，等到时间到达再一起开启。',
  themeColor: 'indigo',
  bgStyle: 'gradient-space',
  openDate: new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
  musicUrl:
    'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5b39912626.mp3?filename=hopeful-piano-112621.mp3',
};
