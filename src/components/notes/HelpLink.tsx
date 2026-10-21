import { providerLabel, type Provider } from "@/lib/payment-links";

type Props = {
  url: string;
  provider: Provider;
};

/** The warm button on every note: opens the author's payment link. */
export function HelpLink({ url, provider }: Props) {
  return (
    <span className="flex flex-col items-start gap-1">
      <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-ember">
        help with this →
      </a>
      <span className="text-xs text-ink-quiet">via {providerLabel(provider)}</span>
    </span>
  );
}
