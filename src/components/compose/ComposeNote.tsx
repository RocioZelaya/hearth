"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type CSSProperties } from "react";
import { createNote } from "@/app/actions/notes";
import { detectProvider, providerLabel } from "@/lib/payment-links";
import { LIMITS } from "@/lib/validation";
import { CharCounter } from "./CharCounter";

const SHEET_TILT = { "--rot": "-0.6deg" } as CSSProperties;

/**
 * The home page's only element: one writing line that, once touched,
 * unfolds into a sheet of paper with a title and a body.
 */
export function ComposeNote() {
  const [state, formAction, pending] = useActionState(createNote, null);
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [wiggling, setWiggling] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Opening the sheet moves the cursor into the title.
  useEffect(() => {
    if (expanded) titleRef.current?.focus();
  }, [expanded]);

  // A rejected submission shakes the sheet, like a pin that won't hold.
  // (state is adjusted during render, the React-sanctioned way to react to a prop change)
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state) setWiggling(true);
  }

  const provider = paymentUrl.trim() ? detectProvider(paymentUrl) : null;
  const errors = state?.fieldErrors ?? {};

  if (!expanded) {
    return (
      <div className="mx-auto w-full max-w-md">
        <input
          type="text"
          aria-label="what do you need?"
          className="writing-line text-lg"
          placeholder="what do you need?"
          value={title}
          maxLength={LIMITS.title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
        />
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto w-full max-w-md animate-settle" noValidate>
      <div
        className={`paper px-7 pt-7 pb-6 ${wiggling ? "animate-wiggle" : ""}`}
        style={SHEET_TILT}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setWiggling(false);
        }}
      >
        <span className="pin" aria-hidden />

        <label className="block">
          <span className="sr-only">title</span>
          <input
            ref={titleRef}
            name="title"
            type="text"
            className="field text-[1.25rem] leading-snug"
            placeholder="what do you need?"
            value={title}
            maxLength={LIMITS.title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <FieldError message={errors.title} />
          <CharCounter value={title} max={LIMITS.title} />
        </div>

        <hr className="divider my-3" />

        <label className="block">
          <span className="sr-only">your note</span>
          <textarea
            name="body"
            className="field min-h-24 text-[1.02rem] leading-relaxed"
            placeholder="a few lines about it. who you are, what it would change."
            value={body}
            maxLength={LIMITS.body}
            rows={4}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </label>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <FieldError message={errors.body} />
          <CharCounter value={body} max={LIMITS.body} />
        </div>
      </div>

      <div className="mt-9 space-y-6">
        <label className="block">
          <span className="text-sm text-ivory-quiet italic">where can people send you money?</span>
          <div className="flex items-baseline gap-3">
            <input
              name="paymentUrl"
              type="text"
              inputMode="url"
              autoComplete="off"
              className="writing-line text-left"
              placeholder="paypal.me/you · mpago.la/… · ko-fi.com/you"
              value={paymentUrl}
              maxLength={LIMITS.paymentUrl}
              onChange={(e) => setPaymentUrl(e.target.value)}
              required
            />
            {provider ? (
              <span className="text-xs whitespace-nowrap text-ivory-quiet">via {providerLabel(provider)}</span>
            ) : null}
          </div>
          <FieldError message={errors.paymentUrl} onWall />
        </label>

        <label className="block">
          <span className="text-sm text-ivory-quiet italic">your name (optional)</span>
          <input
            name="authorName"
            type="text"
            autoComplete="name"
            className="writing-line text-left"
            placeholder="who's asking"
            value={authorName}
            maxLength={LIMITS.authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <FieldError message={errors.authorName} onWall />
        </label>

        {/* Honeypot: hidden from people, filled by bots. See lib/validation. */}
        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <Link href="/hearth" className="quiet quiet-on-wall">
            see the hearth →
          </Link>
          <button type="submit" className="btn btn-ember" disabled={pending}>
            {pending ? "pinning…" : "leave it by the fire"}
          </button>
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm text-ember-soft italic">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function FieldError({ message, onWall = false }: { message?: string; onWall?: boolean }) {
  if (!message) return <span />;
  return (
    <span role="alert" className={`text-xs italic ${onWall ? "text-ember-soft" : "text-ember"}`}>
      {message}
    </span>
  );
}
