"use client";

import { useState } from "react";
import Reveal from "@/components/ui/reveal";

const interests = [
  "Monitoring",
  "Forecast & Prediction",
  "Decision & Action",
  "Integrated Solution",
  "Partnership",
  "Other",
];

const fieldClass =
  "mt-2 w-full border-b border-line bg-transparent py-3 text-sm text-ink outline-none transition-colors placeholder:text-stone/60 focus:border-ink";

const labelClass = "block text-[11px] tracking-[0.18em] text-stone uppercase";

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const nextErrors = {};
    if (!data.fullName?.trim()) nextErrors.fullName = "Full name is required.";
    if (!data.company?.trim())
      nextErrors.company = "Company or organization is required.";
    if (!data.email?.trim()) {
      nextErrors.email = "Work email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!data.interest) nextErrors.interest = "Select an area of interest.";
    if (!data.message?.trim()) nextErrors.message = "A message is required.";
    if (!data.consent) nextErrors.consent = "Please acknowledge the privacy notice.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    try {
      // Replace with the designated company contact channel once configured.
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="border-b border-line">
      <div className="shell py-20 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24">
          <Reveal>
            {status === "success" ? (
              <div
                role="status"
                className="border border-line bg-white/50 p-10"
              >
                <p className="eyebrow">Inquiry received</p>
                <p className="mt-5 text-lg leading-relaxed text-ink">
                  Thank you for contacting SERAVIN. Your inquiry has been
                  received. Our team will review your message and get back to
                  you.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-8 text-sm text-stone underline underline-offset-4 transition-colors hover:text-ink"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-10">
                <div className="grid gap-10 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className={labelClass}>
                      Full name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      className={fieldClass}
                    />
                    <FieldError message={errors.fullName} />
                  </div>

                  <div>
                    <label htmlFor="company" className={labelClass}>
                      Company / Organization *
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Organization name"
                      className={fieldClass}
                    />
                    <FieldError message={errors.company} />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Work email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      className={fieldClass}
                    />
                    <FieldError message={errors.email} />
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Phone number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Include country code"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="interest" className={labelClass}>
                    Area of interest *
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    defaultValue=""
                    className={`${fieldClass} appearance-none`}
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {interests.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.interest} />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Describe the site, challenge, or inquiry"
                    className={`${fieldClass} resize-none`}
                  />
                  <FieldError message={errors.message} />
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-stone">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                    />
                    <span>
                      I acknowledge the privacy notice and consent to SERAVIN
                      processing this inquiry. *
                    </span>
                  </label>
                  <FieldError message={errors.consent} />
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[12px] tracking-[0.1em] text-sand transition-opacity duration-300 hover:opacity-85 disabled:opacity-50"
                  >
                    {status === "loading" ? "Sending…" : "Send Inquiry"}
                    {status !== "loading" && <span aria-hidden="true">→</span>}
                  </button>
                  {status === "error" && (
                    <p role="alert" className="text-sm text-red-700">
                      We could not send your inquiry. Please try again or reach
                      us directly.
                    </p>
                  )}
                </div>
              </form>
            )}
          </Reveal>

          <Reveal delay={0.12}>
            <div className="border-t border-line pt-7">
              <p className="eyebrow">Contact details</p>
              <p className="mt-5 text-sm leading-relaxed text-stone">
                Verified business contact information — company email, phone or
                WhatsApp, office address, and official social channels — will be
                published here once confirmed.
              </p>
            </div>
            <div className="mt-12 border-t border-line pt-7">
              <p className="eyebrow">What happens next</p>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-stone">
                <li>We review your inquiry and monitoring context.</li>
                <li>
                  Our team follows up to clarify parameters, sites, and
                  connectivity.
                </li>
                <li>
                  We outline an appropriate monitoring approach or arrange a
                  demo.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-xs text-red-700">
      {message}
    </p>
  );
}
