import { providerLabel, type Provider } from "@/lib/payment-links";

type Props = {
  url: string;
  provider: Provider;
};

/** The warm button on every note: opens the author's payment link, naming where it goes. */
export function HelpLink({ url, provider }: Props) {
  const label = provider === "other" ? "warm this up" : `warm this up on ${providerLabel(provider)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-ember">
      {label}
    </a>
  );
}
