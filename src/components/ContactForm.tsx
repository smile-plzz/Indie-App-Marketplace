"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Posts to the existing Formspree endpoint  -  the integration that works today.
 * Validation runs on blur, not on keystroke, and failure offers the direct
 * email address as the fallback path rather than just reporting the error.
 */
export function ContactForm({
  endpoint,
  email,
  phone,
  phoneHref,
}: {
  endpoint: string;
  email: string;
  phone: string;
  phoneHref: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string) {
    let message = "";
    if (!value.trim()) {
      message =
        name === "message"
          ? "Add a message so I know what this is about."
          : "This field is required.";
    } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = "Enter a complete email address so I can reply.";
    }
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
    return !message;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // A bot fills every field, including the one no sighted human sees or
    // tabs to. A hit here reports success without a network call.
    if (String(data.get("_gotcha") ?? "").length > 0) {
      setStatus("sent");
      form.reset();
      return;
    }

    const valid = (["name", "email", "message"] as const)
      .map((field) => validateField(field, String(data.get(field) ?? "")))
      .every(Boolean);
    if (!valid) return;

    setStatus("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        style={{
          border: "1px solid var(--color-accent)",
          padding: "28px 30px",
          maxWidth: 440,
        }}
        role="status"
      >
        <div className="display" style={{ fontFamily: "var(--font-heading)", fontSize: 26 }}>
          Thank you  -  that reached me.
        </div>
        <p
          style={{
            fontSize: 14.5,
            color: "var(--color-neutral-800)",
            lineHeight: 1.7,
            margin: "8px 0 0",
          }}
        >
          I reply to everything within a couple of days. If it is urgent,{" "}
          <a href={`tel:${phoneHref}`}>call {phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 440,
      }}
    >
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field
          name="name"
          label="Name"
          placeholder="John Doe"
          error={errors.name}
          onBlurValidate={validateField}
        />
        <Field
          name="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          error={errors.email}
          onBlurValidate={validateField}
        />
      </div>

      <Field
        name="message"
        label="Message"
        placeholder="I'd like to discuss…"
        textarea
        error={errors.message}
        onBlurValidate={validateField}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ alignSelf: "flex-start" }}
          disabled={status === "sending"}
        >
          Send message
        </button>
        {status === "sending" ? (
          <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
            Sending…
          </span>
        ) : null}
      </div>

      {status === "error" ? (
        <div
          role="alert"
          style={{
            border: "1px solid var(--color-accent-prose)",
            padding: "12px 14px",
            fontSize: 14,
            color: "var(--color-accent-prose)",
          }}
        >
          Message did not send. Email <a href={`mailto:${email}`}>{email}</a>{" "}
          directly, or try again.
        </div>
      ) : null}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  textarea,
  error,
  onBlurValidate,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  error?: string;
  onBlurValidate: (name: string, value: string) => boolean;
}) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  const shared = {
    id,
    name,
    className: "input",
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onBlur: (e: { target: { value: string } }) =>
      onBlurValidate(name, e.target.value),
  };

  return (
    <div className="field" data-invalid={error ? "true" : undefined}>
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea {...shared} rows={4} />
      ) : (
        <input {...shared} type={type} />
      )}
      {error ? (
        <div className="field-error" id={errorId}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
