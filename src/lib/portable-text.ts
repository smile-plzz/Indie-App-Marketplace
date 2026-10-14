/**
 * A closed Markdown subset ↔ Portable Text bridge.
 *
 * The design constrains a post body to exactly what the reading page renders:
 * paragraphs, h2, h3, blockquote, links and italic emphasis. Nothing else has
 * a type style, so nothing else may be authored. Because the subset is closed,
 * the two directions round-trip losslessly and the editor can stay a plain
 * textarea with a toolbar  -  no editor library, and no output the public page
 * cannot style.
 */

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: "link"; _key: string; href: string };

export type Block = {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  markDefs: MarkDef[];
  children: Span[];
};

let counter = 0;
function nextKey(seed: string) {
  counter += 1;
  return `${seed}${counter.toString(36)}`;
}

/** Splits one line into spans, honouring *italic* and [text](href). */
function parseInline(line: string): { children: Span[]; markDefs: MarkDef[] } {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  const pattern = /(\[([^\]]+)\]\(([^)\s]+)\))|(\*([^*]+)\*)/g;

  let last = 0;
  let match: RegExpExecArray | null;

  const push = (text: string, marks: string[]) => {
    if (!text) return;
    children.push({ _type: "span", _key: nextKey("s"), text, marks });
  };

  while ((match = pattern.exec(line))) {
    push(line.slice(last, match.index), []);
    if (match[1]) {
      const key = nextKey("l");
      markDefs.push({ _type: "link", _key: key, href: match[3] });
      push(match[2], [key]);
    } else {
      push(match[5], ["em"]);
    }
    last = match.index + match[0].length;
  }
  push(line.slice(last), []);

  if (!children.length) push("", []);
  return { children, markDefs };
}

export function markdownToBlocks(source: string): Block[] {
  return source
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      let style: Block["style"] = "normal";
      let text = chunk;

      if (text.startsWith("### ")) {
        style = "h3";
        text = text.slice(4);
      } else if (text.startsWith("## ")) {
        style = "h2";
        text = text.slice(3);
      } else if (text.startsWith("> ")) {
        style = "blockquote";
        text = text.replace(/^> ?/gm, "");
      }

      // A hard-wrapped paragraph is one paragraph; only blank lines split.
      text = text.replace(/\s*\n\s*/g, " ").trim();

      const { children, markDefs } = parseInline(text);
      return { _type: "block" as const, _key: nextKey("b"), style, markDefs, children };
    });
}

export function blocksToMarkdown(body: unknown): string {
  if (!Array.isArray(body)) return "";

  return body
    .filter((block): block is Block => {
      const candidate = block as { _type?: string };
      return candidate?._type === "block";
    })
    .map((block) => {
      const text = (block.children ?? [])
        .map((span) => {
          const link = span.marks
            ?.map((mark) => block.markDefs?.find((def) => def._key === mark))
            .find(Boolean);
          if (link) return `[${span.text}](${link.href})`;
          if (span.marks?.includes("em")) return `*${span.text}*`;
          return span.text;
        })
        .join("");

      if (block.style === "h2") return `## ${text}`;
      if (block.style === "h3") return `### ${text}`;
      if (block.style === "blockquote") return `> ${text}`;
      return text;
    })
    .join("\n\n");
}

/** Reading time, from the same source the editor shows a word count for. */
export function readingStats(source: string) {
  const words = source.trim() ? source.trim().split(/\s+/).length : 0;
  return { words, minutes: words ? Math.max(1, Math.round(words / 220)) : 0 };
}
