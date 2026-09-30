// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/music/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm nhạc mới: chỉ cần thả file audio (.mp3, .wav, .ogg, .flac) vào public/assets/music/
// Tùy chọn: chỉnh sửa public/assets/music/meta.json để đặt tiêu đề và tên nghệ sĩ mong muốn

import { AudioTrack } from '../types';

export const MUSIC_TRACKS: AudioTrack[] = [
  {
    "id": "pokemon_black_white_music_-_sky_arrow_bridge",
    "title": "Sky Arrow Bridge (Cầu Mũi Tên Trời)",
    "artist": "Pokémon Black & White OST",
    "url": "./assets/music/Pokemon Black White Music - Sky Arrow Bridge.mp3"
  },
  {
    "id": "pokemon_x_y-bicycle_theme_ost",
    "title": "Bicycle Theme (Khúc Dạo Xe Đạp)",
    "artist": "Pokémon X & Y OST",
    "url": "./assets/music/Pokemon X & Y-Bicycle theme [OST].mp3"
  },
  {
    "id": "春日狂想_洛克王國bgm",
    "title": "Xuân Nhật Cuồng Tưởng (春日狂想)",
    "artist": "Roco Kingdom OST (洛克王國)",
    "url": "./assets/music/春日狂想 (洛克王國BGM).mp3"
  },
  {
    "id": "風_-_ゆったりピアノ曲_音楽素材musmus",
    "title": "Khúc Dương Cầm Gió Thoảng (ゆったりピアノ曲)",
    "artist": "MusMus Studio (風)",
    "url": "./assets/music/風 - ゆったりピアノ曲【音楽素材MusMus】.mp3"
  },
  {
    "id": "synth_tokyo_sunset",
    "title": "Tokyo Sunset Ambient Chords",
    "artist": "Neverland Lo-Fi Synthesizer",
    "url": "procedural"
  }
];
