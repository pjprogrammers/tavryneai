type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface JsonLdProps {
  data: Record<string, JsonValue>;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
