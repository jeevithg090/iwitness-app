"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, LocateFixed } from "lucide-react";
import { Input } from "@/components/ui/field";

// The Mapbox widget touches `window`, so load it on the client only and only when configured.
const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false },
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface LocationInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange: (coords: { latitude: number; longitude: number } | null) => void;
  describedBy?: string;
}

const GEO_ERRORS: Record<number, string> = {
  1: "Location access was denied. Allow it in your browser settings or type the address.",
  2: "Your location is unavailable right now. Please type the address.",
  3: "Finding your location took too long. Please try again or type the address.",
};

export function LocationInput({
  id,
  value,
  onChange,
  onCoordinatesChange,
  describedBy,
}: LocationInputProps) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Your browser does not support location access.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onCoordinatesChange({ latitude: coords.latitude, longitude: coords.longitude });
        onChange(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      (geoError) => {
        setError(GEO_ERRORS[geoError.code] ?? "Could not get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const input = (
    <Input
      id={id}
      name="address"
      type="text"
      autoComplete={MAPBOX_TOKEN ? "street-address" : "off"}
      value={value}
      maxLength={300}
      onChange={(event) => {
        onChange(event.target.value);
        onCoordinatesChange(null);
      }}
      placeholder="Street, landmark or area"
      className="pr-14"
      aria-describedby={
        [describedBy, error ? `${id}-geo-error` : null].filter(Boolean).join(" ") ||
        undefined
      }
    />
  );

  return (
    <div>
      <div className="relative">
        {MAPBOX_TOKEN ? (
          <AddressAutofill
            accessToken={MAPBOX_TOKEN}
            onRetrieve={(result) => {
              const [longitude, latitude] =
                result.features[0]?.geometry.coordinates ?? [];
              if (typeof latitude === "number" && typeof longitude === "number") {
                onCoordinatesChange({ latitude, longitude });
              }
              const place = result.features[0]?.properties.full_address;
              if (place) onChange(place);
            }}
          >
            {input}
          </AddressAutofill>
        ) : (
          input
        )}
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-accent transition-colors hover:bg-accent/10 disabled:opacity-60"
          aria-label="Use my current location"
          title="Use my current location"
        >
          {locating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-geo-error`}
          role="alert"
          className="mt-1.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
