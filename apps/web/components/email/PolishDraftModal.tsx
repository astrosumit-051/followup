"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface PolishedVersion {
  content: string;
  wordCount: number;
  wordCountDiff: number;
}

interface PolishDraftModalProps {
  isOpen: boolean;
  roughDraft: string;
  contextType?: "COLD_EMAIL" | "FOLLOW_UP";
  onClose: () => void;
  onSelectVersion: (content: string) => void;
}

interface PolishDraftResponse {
  formal: PolishedVersion;
  casual: PolishedVersion;
  elaborate: PolishedVersion;
  concise: PolishedVersion;
}

const STYLE_CONFIGS = {
  formal: {
    label: "Formal",
    badgeColor: "bg-blue-600 text-white",
    description: "Professional and business-appropriate tone",
  },
  casual: {
    label: "Casual",
    badgeColor: "bg-green-600 text-white",
    description: "Friendly and conversational style",
  },
  elaborate: {
    label: "Elaborate",
    badgeColor: "bg-purple-600 text-white",
    description: "Detailed with more context and information",
  },
  concise: {
    label: "Concise",
    badgeColor: "bg-orange-600 text-white",
    description: "Brief and to the point",
  },
};

export function PolishDraftModal({
  isOpen,
  roughDraft,
  contextType,
  onClose,
  onSelectVersion,
}: PolishDraftModalProps) {
  const [polishedVersions, setPolishedVersions] =
    useState<PolishDraftResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate polished versions when modal opens
  useEffect(() => {
    if (isOpen && !polishedVersions && !isLoading && !error) {
      polishDraft();
    }
  }, [isOpen]);

  const polishDraft = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation PolishDraft($input: PolishDraftInput!) {
              polishDraft(input: $input) {
                formal {
                  content
                  wordCount
                  wordCountDiff
                }
                casual {
                  content
                  wordCount
                  wordCountDiff
                }
                elaborate {
                  content
                  wordCount
                  wordCountDiff
                }
                concise {
                  content
                  wordCount
                  wordCountDiff
                }
              }
            }
          `,
          variables: {
            input: {
              roughDraft,
              contextType: contextType || null,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to polish draft");
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setPolishedVersions(data.data.polishDraft);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to polish draft. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVersion = (content: string) => {
    onSelectVersion(content);
    onClose();
  };

  const handleTryAgain = () => {
    setError(null);
    polishDraft();
  };

  const formatWordCountDiff = (diff: number): string => {
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff}%`;
  };

  const renderVersionCard = (
    styleKey: keyof typeof STYLE_CONFIGS,
    version: PolishedVersion
  ) => {
    const config = STYLE_CONFIGS[styleKey];

    return (
      <Card key={styleKey} className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{config.label}</CardTitle>
            <Badge className={config.badgeColor}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium">
              {version.wordCount} words
            </span>
            <span
              className={`text-sm ${
                version.wordCountDiff > 0
                  ? "text-purple-600"
                  : "text-green-600"
              }`}
            >
              ({formatWordCountDiff(version.wordCountDiff)})
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 p-4 bg-muted rounded-md mb-4 max-h-[300px] overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{version.content}</p>
          </div>
          <Button
            onClick={() => handleSelectVersion(version.content)}
            className="w-full"
          >
            Use This Version
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[1400px] w-[90vw] max-h-[90vh] overflow-y-auto
                      sm:max-w-[1400px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Polish Your Draft
          </DialogTitle>
          <DialogDescription>
            Choose the style that best fits your needs. AI will refine your
            draft in four different styles with varying levels of formality and
            detail.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="py-8">
            <div className="flex flex-col items-center gap-4 mb-8">
              <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
              <p className="text-lg font-medium">
                Polishing your draft with AI...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a few seconds
              </p>
            </div>

            <div
              data-testid="polish-draft-grid"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[...Array(4)].map((_, index) => (
                <Card key={index} data-testid="polish-draft-skeleton">
                  <CardHeader>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[200px] w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive mb-2">
                Failed to polish draft
              </p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={handleTryAgain} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Success State - 4 Polished Versions */}
        {polishedVersions && !isLoading && !error && (
          <div
            data-testid="polish-draft-grid"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6"
          >
            {renderVersionCard("formal", polishedVersions.formal)}
            {renderVersionCard("casual", polishedVersions.casual)}
            {renderVersionCard("elaborate", polishedVersions.elaborate)}
            {renderVersionCard("concise", polishedVersions.concise)}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
