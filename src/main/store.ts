import { app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import type { DestinationInfo } from '../shared/types.js';

interface Settings {
  destination: DestinationInfo | null;
}

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json');
}

async function readSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(getSettingsPath(), 'utf-8');
    return JSON.parse(data) as Settings;
  } catch {
    return { destination: null };
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  await fs.writeFile(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
}

export async function getDestination(): Promise<DestinationInfo | null> {
  const settings = await readSettings();
  return settings.destination;
}

export async function setDestination(info: DestinationInfo): Promise<void> {
  const settings = await readSettings();
  settings.destination = info;
  await writeSettings(settings);
}
