type JsonLdValue =
  | Record<string, unknown>
  | ReadonlyArray<Record<string, unknown>>;

type JsonLdScriptProps = {
  data: JsonLdValue;
  id: string;
};

export function JsonLdScript({ data, id }: JsonLdScriptProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      id={id}
      suppressHydrationWarning
      type="application/ld+json"
    />
  );
}
