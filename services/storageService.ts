import { Directory, File, Paths } from 'expo-file-system';
import { AppState } from '../utils/types';
import { defaultAppState } from '../utils/mockData';

const baseDirectory = new Directory(Paths.cache, 'smartcart');
const imageDirectory = new Directory(baseDirectory, 'receipts');
const stateFile = new File(baseDirectory, 'app-state.json');

async function ensureDirectories() {
  if (!baseDirectory.exists) {
    baseDirectory.create();
  }

  if (!imageDirectory.exists) {
    imageDirectory.create();
  }
}

export async function loadAppState(): Promise<AppState> {
  try {
    await ensureDirectories();
    if (!stateFile.exists) {
      return defaultAppState;
    }

    const raw = await stateFile.text();
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...defaultAppState,
      ...parsed,
      profile: {
        ...defaultAppState.profile,
        ...parsed.profile,
      },
      receipts: parsed.receipts ?? [],
      recommendations: parsed.recommendations ?? [],
    };
  } catch {
    return defaultAppState;
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  try {
    await ensureDirectories();
    if (!stateFile.exists) {
      stateFile.create();
    }
    stateFile.write(JSON.stringify(state));
  } catch {
    // Keep the app usable in Expo Go even when scoped storage writes fail.
  }
}

export async function persistReceiptImage(sourceUri: string): Promise<string> {
  try {
    await ensureDirectories();
    const extension = sourceUri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const targetFile = new File(imageDirectory, `receipt-${Date.now()}.${extension}`);
    const sourceFile = new File(sourceUri);
    sourceFile.copy(targetFile);
    return targetFile.uri;
  } catch {
    return sourceUri;
  }
}
