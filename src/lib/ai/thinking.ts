export function stripThinking(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
    .replace(/<reason>[\s\S]*?<\/reason>/g, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '')
    .replace(/\[\s*think[^\]]*\]/gi, '')
    .replace(/\[\s*\/think\s*\]/gi, '')
    .trim();
}
