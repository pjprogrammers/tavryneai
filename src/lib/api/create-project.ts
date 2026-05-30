import { useAuthStore } from '@/lib/store/useAuthStore';

export async function createProjectViaApi(
  title: string,
  description: string,
  framework: string,
): Promise<string | null> {
  try {
    const state = useAuthStore.getState();
    const idToken = state.idToken;
    if (!idToken) return null;

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ title, description, framework }),
    });
    if (!res.ok) return null;
    const project = await res.json();
    return project.id;
  } catch {
    return null;
  }
}
