"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setStatus("submitting");

    const formData = new FormData(event.target);
    const data = {
      name: formData.get("name")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      message: formData.get("message")?.toString().trim() || "",
    };

    // Client-side validation
    const newErrors = {};
    if (!data.name) {
      newErrors.name = "Name is required";
    }
    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!data.message) {
      newErrors.message = "Message is required";
    } else if (data.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus("idle");
      return;
    }

    // Simulate form submission (no actual email sending)
    // In production, you would send this to an API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Contact form submission:", data);
    setStatus("success");
    event.target.reset();
  }

  if (status === "success") {
    return (
      <div
        className="text-center py-8 space-y-4"
        role="alert"
        aria-live="polite"
      >
        <div className="text-4xl">✓</div>
        <h3 className="text-lg font-semibold">Message Sent</h3>
        <p className="text-muted-foreground">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
        <Button onClick={() => setStatus("idle")} variant="outline">
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          aria-required="true"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          disabled={status === "submitting"}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={status === "submitting"}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium">
          Message <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          aria-required="true"
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          disabled={status === "submitting"}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-destructive" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send Message"}
      </Button>

      {status === "error" && (
        <p className="text-sm text-destructive text-center" role="alert" aria-live="assertive">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
