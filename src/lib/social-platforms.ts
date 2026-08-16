import type { IconType } from "react-icons";
import { FaLinkedin, FaSlack } from "react-icons/fa6";
import {
  SiBluesky,
  SiDeviantart,
  SiDribbble,
  SiFacebook,
  SiFlickr,
  SiGithub,
  SiIcq,
  SiInstagram,
  SiLine,
  SiMastodon,
  SiMedium,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiSoundcloud,
  SiSteam,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTumblr,
  SiTwitch,
  SiVk,
  SiWechat,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";

export type SocialPlatform = {
  slug: string;
  label: string;
  Icon: IconType;
  placeholder: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { slug: "x", label: "X", Icon: SiX, placeholder: "https://x.com/username" },
  { slug: "instagram", label: "Instagram", Icon: SiInstagram, placeholder: "https://instagram.com/username" },
  { slug: "facebook", label: "Facebook", Icon: SiFacebook, placeholder: "https://facebook.com/username" },
  { slug: "linkedin", label: "LinkedIn", Icon: FaLinkedin, placeholder: "https://linkedin.com/in/username" },
  { slug: "tiktok", label: "TikTok", Icon: SiTiktok, placeholder: "https://tiktok.com/@username" },
  { slug: "youtube", label: "YouTube", Icon: SiYoutube, placeholder: "https://youtube.com/@username" },
  { slug: "whatsapp", label: "WhatsApp", Icon: SiWhatsapp, placeholder: "https://wa.me/1234567890" },
  { slug: "telegram", label: "Telegram", Icon: SiTelegram, placeholder: "https://t.me/username" },
  { slug: "snapchat", label: "Snapchat", Icon: SiSnapchat, placeholder: "https://snapchat.com/add/username" },
  { slug: "threads", label: "Threads", Icon: SiThreads, placeholder: "https://threads.net/@username" },
  { slug: "bluesky", label: "Bluesky", Icon: SiBluesky, placeholder: "https://bsky.app/profile/username" },
  { slug: "pinterest", label: "Pinterest", Icon: SiPinterest, placeholder: "https://pinterest.com/username" },
  { slug: "reddit", label: "Reddit", Icon: SiReddit, placeholder: "https://reddit.com/user/username" },
  { slug: "github", label: "GitHub", Icon: SiGithub, placeholder: "https://github.com/username" },
  { slug: "mastodon", label: "Mastodon", Icon: SiMastodon, placeholder: "https://mastodon.social/@username" },
  { slug: "medium", label: "Medium", Icon: SiMedium, placeholder: "https://medium.com/@username" },
  { slug: "twitch", label: "Twitch", Icon: SiTwitch, placeholder: "https://twitch.tv/username" },
  { slug: "dribbble", label: "Dribbble", Icon: SiDribbble, placeholder: "https://dribbble.com/username" },
  { slug: "flickr", label: "Flickr", Icon: SiFlickr, placeholder: "https://flickr.com/people/username" },
  { slug: "deviantart", label: "DeviantArt", Icon: SiDeviantart, placeholder: "https://deviantart.com/username" },
  { slug: "tumblr", label: "Tumblr", Icon: SiTumblr, placeholder: "https://username.tumblr.com" },
  { slug: "soundcloud", label: "SoundCloud", Icon: SiSoundcloud, placeholder: "https://soundcloud.com/username" },
  { slug: "steam", label: "Steam", Icon: SiSteam, placeholder: "https://steamcommunity.com/id/username" },
  { slug: "slack", label: "Slack", Icon: FaSlack, placeholder: "https://workspace.slack.com" },
  { slug: "vk", label: "VK", Icon: SiVk, placeholder: "https://vk.com/username" },
  { slug: "wechat", label: "WeChat", Icon: SiWechat, placeholder: "WeChat ID" },
  { slug: "line", label: "Line", Icon: SiLine, placeholder: "https://line.me/ti/p/username" },
  { slug: "icq", label: "ICQ", Icon: SiIcq, placeholder: "ICQ number" },
];

export function findSocialPlatform(slug: string): SocialPlatform | undefined {
  return SOCIAL_PLATFORMS.find((p) => p.slug === slug);
}
