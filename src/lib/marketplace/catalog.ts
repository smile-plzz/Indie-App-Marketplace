import type { MarketplaceProduct } from "./types";

export const BUILTIN_PRODUCTS: MarketplaceProduct[] = [
  {
    id: "prod_localflix",
    slug: "localflix",
    title: "LocalFlix",
    tagline: "Your local media collection, organized like a private streaming service.",
    summary:
      "Catalogs personal movies, shows, and videos locally with posters, genres, and metadata, keeping your library private with zero telemetry.",
    description:
      "LocalFlix is an offline-first Windows media hub built for people who store their movies, series, and home videos locally. It automatically indexes your media folders, fetches clean posters and episode descriptions, and provides a polished cinematic interface without uploading your personal files or viewing habits to any cloud server.",
    category: "Media & Video",
    priceBDT: 45000, // 450 BDT
    priceUSD: 450, // $4.50 USD
    status: "published",
    featured: true,
    repoUrl: "https://github.com/smile-plzz/LocalFlix",
    license: "MIT",
    minOS: "Windows 10 / 11 (64-bit)",
    systemRequirements: [
      "Windows 10 version 1903 or higher (64-bit) / Windows 11",
      "Intel Core i3 / AMD Ryzen 3 or higher",
      "4 GB RAM minimum (8 GB recommended for 4K video playback)",
      "250 MB free disk space for installer and application data",
      "Hardware-accelerated graphics (DirectX 11+ compatible)",
    ],
    features: [
      {
        title: "100% Offline and Private",
        description:
          "Runs entirely on your machine. Your media files, watch history, and library tags never leave your system.",
      },
      {
        title: "Local and Configurable Metadata",
        description:
          "Reads existing NFO files and folder posters, or lets you enter your own free API key for automatic metadata enrichment.",
      },
      {
        title: "Modern Fluent Windows UI",
        description:
          "Native feel with smooth acrylic backdrops, keyboard navigation, instant search, and full light/dark theme support.",
      },
      {
        title: "Subtitles and Resume Playback",
        description:
          "Built-in SRT/VTT subtitle detection, audio track switching, and persistent bookmarking across all video files.",
      },
    ],
    faq: [
      {
        question: "Is the source code really free?",
        answer:
          "Yes. The source code is publicly accessible on GitHub under the MIT license. You can clone the repository and build it yourself for free at any time. The purchase here provides a pre-built, code-signed, auto-updating installer with checksum verification and direct email support.",
      },
      {
        question: "Does LocalFlix include or stream pirated content?",
        answer:
          "No. LocalFlix strictly organizes files already stored on your computer or local network storage. It contains no streaming sources or pirate directories.",
      },
      {
        question: "How do updates work?",
        answer:
          "Every buyer receives email notifications when a new version is released and can download new builds directly from their order lookup page.",
      },
    ],
    currentVersion: "v1.2.0",
    installerFileKey: "releases/localflix/LocalFlix-v1.2.0-Setup.exe",
    sha256Checksum: "a1c3e89dfb830d1e2e4b0c793ff82a5c10672e457f58a36efb349b109e53097c",
    installerSize: "18.4 MB",
    releaseDate: "2026-10-10",
    changelog: [
      "v1.2.0: Added hardware-accelerated HEVC/AV1 playback and custom poster cropping.",
      "v1.1.2: Fixed subtitle sync issue for variable framerate MP4 files.",
      "v1.0.0: Initial public release.",
    ],
  },
  {
    id: "prod_hddcachewarmer",
    slug: "hdd-cache-warmer",
    title: "HDDCacheWarmer",
    tagline: "Smart disk prefetcher and working set warmer for Windows.",
    summary:
      "Eliminates sluggish read latency and disk chugging by priming the Windows system cache for your active projects and game directories.",
    description:
      "When loading large software projects, git repositories with thousands of files, or game assets from mechanical drives or SATA SSDs, cold cache penalties cause noticeable stutter. HDDCacheWarmer performs sequential pre-reads into the Windows operating system cache at low I/O priority, keeping files warm in RAM before you need them.",
    category: "System Utilities",
    priceBDT: 30000, // 300 BDT
    priceUSD: 300, // $3.00 USD
    status: "published",
    featured: true,
    repoUrl: "https://github.com/smile-plzz/HDDCacheWarmer",
    license: "MIT",
    minOS: "Windows 10 / 11 (64-bit)",
    systemRequirements: [
      "Windows 10 / Windows 11 (64-bit)",
      "Any dual-core x64 CPU",
      "2 GB RAM minimum",
      "15 MB disk space",
      "Standard user privileges (no admin rights required for basic cache warming)",
    ],
    features: [
      {
        title: "Intelligent Directory Priming",
        description:
          "Warmer runs sequential reads on your configured directory profiles to pull inodes and data blocks into RAM cache.",
      },
      {
        title: "Background and Idle Scheduling",
        description:
          "Operates at lowest I/O priority (Idle/Low) so your active foreground work and gaming sessions never experience frame drops.",
      },
      {
        title: "Directory Profiles and Presets",
        description:
          "Create quick launch shortcuts for node_modules directories, Unreal Engine content, or game asset libraries.",
      },
    ],
    faq: [
      {
        question: "Does this write or modify my files?",
        answer:
          "No. HDDCacheWarmer strictly performs read-only sequential operations. It never alters, moves, or writes data to your drives.",
      },
      {
        question: "Can I build it myself?",
        answer:
          "Yes, the full source code is licensed under MIT and available on GitHub. You can compile it using Visual Studio or gcc.",
      },
    ],
    currentVersion: "v1.1.4",
    installerFileKey: "releases/hddcachewarmer/HDDCacheWarmer-v1.1.4-Setup.exe",
    sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    installerSize: "4.8 MB",
    releaseDate: "2026-09-28",
    changelog: [
      "v1.1.4: Added memory usage limit guard to prevent cache overfill on systems with under 8 GB RAM.",
      "v1.1.0: Tray icon minimization and startup shortcut option.",
      "v1.0.0: Initial release.",
    ],
  },
  {
    id: "prod_safegamingoptimizer",
    slug: "safe-gaming-optimizer",
    title: "Safe-Gaming-Optimizer",
    tagline: "Telemetry-free Windows latency tuner and process priority optimizer.",
    summary:
      "A transparent, open-source optimizer that tunes system timer resolution, power throttling, and background noise without sketchy registry hacks.",
    description:
      "Most third-party PC optimizers are filled with telemetry, adware, or dangerous registry scripts that break Windows Update. Safe-Gaming-Optimizer is 100% open-source, transparent, and reversible. It safely adjusts multimedia timer resolution (0.5ms precision), disables background Windows Power Throttling for gaming executables, and restores defaults cleanly upon exit.",
    category: "Gaming & Performance",
    priceBDT: 35000, // 350 BDT
    priceUSD: 350, // $3.50 USD
    status: "published",
    featured: true,
    repoUrl: "https://github.com/smile-plzz/Safe-Gaming-Optimizer",
    license: "Apache-2.0",
    minOS: "Windows 10 / 11 (64-bit)",
    systemRequirements: [
      "Windows 10 20H2 or Windows 11 (64-bit)",
      "Intel or AMD 64-bit processor",
      "Administrator permissions (required to adjust system timer resolution and process QoS)",
    ],
    features: [
      {
        title: "High-Resolution Timer (0.5ms)",
        description:
          "Enables microsecond-precision timer calls for reduced input latency and more consistent frame pacing in competitive titles.",
      },
      {
        title: "Clean One-Click Rollback",
        description:
          "Every setting is non-destructive. Clicking 'Restore Windows Defaults' instantly resets all system states.",
      },
      {
        title: "Zero Adware or Bundled Software",
        description:
          "No background upsells, no crypto miners, and zero telemetry. Code signed and checksum verified.",
      },
    ],
    faq: [
      {
        question: "Will anti-cheat systems ban this tool?",
        answer:
          "No. Safe-Gaming-Optimizer does not hook, inject, or modify game memory. It uses official Windows APIs (timeBeginPeriod and SetProcessInformation).",
      },
      {
        question: "Is building from source free?",
        answer:
          "Yes, visit the GitHub repository link to build the C#/WPF project directly from source for free.",
      },
    ],
    currentVersion: "v1.0.8",
    installerFileKey: "releases/safegamingoptimizer/SafeGamingOptimizer-v1.0.8-Setup.exe",
    sha256Checksum: "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
    installerSize: "6.2 MB",
    releaseDate: "2026-10-02",
    changelog: [
      "v1.0.8: Added automated game detection profile for Steam and Epic Games launchers.",
      "v1.0.4: Dark mode styling and improved DPI scaling on 4K displays.",
      "v1.0.0: Initial stable release.",
    ],
  },
  {
    id: "prod_photomanagementapp",
    slug: "photo-management-app",
    title: "PhotoManagementApp",
    tagline: "Fast, offline photo deduplicator and EXIF timeline viewer.",
    summary:
      "Organize messy photo dumps into clean YYYY/MM folders, strip or inspect EXIF tags, and eliminate exact and perceptual duplicates in seconds.",
    description:
      "Designed for privacy-minded photographers and archivists, PhotoManagementApp sorts camera dumps and smartphone photos into organized directory hierarchies. It features perceptual image hashing to find duplicate or near-duplicate shots (e.g. burst photos), and includes an EXIF sanitation utility to remove GPS coordinates before sharing.",
    category: "Productivity",
    priceBDT: 40000, // 400 BDT
    priceUSD: 400, // $4.00 USD
    status: "published",
    featured: false,
    repoUrl: "https://github.com/smile-plzz/PhotoManagementApp",
    license: "MIT",
    minOS: "Windows 10 / 11 (64-bit)",
    systemRequirements: [
      "Windows 10 / Windows 11 (64-bit)",
      "4 GB RAM minimum",
      "50 MB disk space",
      "Support for JPEG, PNG, WEBP, and RAW formats (CR2, NEF, ARW, DNG)",
    ],
    features: [
      {
        title: "Perceptual Image Hashing",
        description:
          "Finds duplicate images even if they were resized, compressed, or saved under different filenames.",
      },
      {
        title: "Non-Destructive Organization",
        description:
          "Preview folder moves before they happen. Keeps original files intact until you explicitly confirm.",
      },
      {
        title: "EXIF Geolocation Scrubber",
        description:
          "Inspect GPS coordinates, camera model, and exposure data, with one-click batch privacy stripping.",
      },
    ],
    faq: [
      {
        question: "Does it upload photos to the cloud?",
        answer:
          "Never. All image hashing, thumbnail generation, and EXIF processing happen strictly in local memory.",
      },
    ],
    currentVersion: "v1.0.3",
    installerFileKey: "releases/photomanagementapp/PhotoManagementApp-v1.0.3-Setup.exe",
    sha256Checksum: "8f434346648f6b96df89dda901c5176b10e6d83961dd3c1ac88b59b2dc327aa4",
    installerSize: "14.1 MB",
    releaseDate: "2026-08-15",
    changelog: [
      "v1.0.3: Added Sony ARW and Canon CR3 RAW format thumbnailing.",
      "v1.0.0: Initial release.",
    ],
  },
  {
    id: "prod_dedupelight",
    slug: "dedupe-light",
    title: "dedupe-light",
    tagline: "High-performance duplicate file finder for massive storage drives.",
    summary:
      "Quickly scan millions of files across internal drives and external backups to reclaim gigabytes of wasted storage safely.",
    description:
      "A lightweight, blazingly fast Windows utility that discovers duplicate files without thrashing your disks. Uses a three-stage progressive filtering pipeline: instant file-size grouping, 4KB header comparison, and Blake3 cryptographic hash verification.",
    category: "System Utilities",
    priceBDT: 25000, // 250 BDT
    priceUSD: 250, // $2.50 USD
    status: "published",
    featured: false,
    repoUrl: "https://github.com/smile-plzz/dedupe-light",
    license: "MIT",
    minOS: "Windows 10 / 11 (64-bit)",
    systemRequirements: [
      "Windows 10 / Windows 11 (64-bit)",
      "1 GB RAM",
      "10 MB disk space",
      "Supports NTFS, exFAT, and ReFS storage volumes",
    ],
    features: [
      {
        title: "Blake3 Multi-threaded Hashing",
        description:
          "Utilizes SIMD instructions and all available CPU cores to hash files at disk read limit speeds.",
      },
      {
        title: "Safe Deletion and Hardlink Modes",
        description:
          "Send duplicates to Windows Recycle Bin, export an action script, or replace duplicates with NTFS hardlinks.",
      },
    ],
    faq: [
      {
        question: "Is this safe to run on system folders?",
        answer:
          "By default, Windows system folders (C:\\Windows, C:\\Program Files) are protected from accidental modifications.",
      },
    ],
    currentVersion: "v1.0.1",
    installerFileKey: "releases/dedupelight/dedupe-light-v1.0.1-Setup.exe",
    sha256Checksum: "2c624232cdd221771294dfbb310aca000a0df6ac9b66b0d199bf41e418645a83",
    installerSize: "3.5 MB",
    releaseDate: "2026-07-20",
    changelog: [
      "v1.0.1: Added exclusion filters for hidden dot-files and temporary cache extensions.",
      "v1.0.0: Initial release.",
    ],
  },
];

export async function getAllProducts(): Promise<MarketplaceProduct[]> {
  // Built-in catalog provides instant offline support.
  // When Sanity is configured with documents, it can merge or augment this list.
  return BUILTIN_PRODUCTS.filter((p) => p.status === "published");
}

export async function getProductBySlug(slug: string): Promise<MarketplaceProduct | null> {
  const products = await getAllProducts();
  const found = products.find((p) => p.slug === slug);
  return found || null;
}

export function formatPrice(amountInSmallestUnit: number, currency: "BDT" | "USD"): string {
  if (currency === "BDT") {
    // 35000 poisha = 350 BDT
    const bdt = amountInSmallestUnit / 100;
    return `BDT ${bdt.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  // 350 cents = $3.50 USD
  const usd = amountInSmallestUnit / 100;
  return `$${usd.toFixed(2)} USD`;
}
