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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface Template {
  subject: string;
  body: string;
}

interface AITemplateModalProps {
  isOpen: boolean;
  contactId: string;
  context?: string;
  emailType?: "followup" | "cold";
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

interface TemplateGenerationResponse {
  formal: Template;
  casual: Template;
}

export function AITemplateModal({
  isOpen,
  contactId,
  context,
  emailType = "followup",
  onClose,
  onSelectTemplate,
}: AITemplateModalProps) {
  const [templates, setTemplates] = useState<TemplateGenerationResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate templates when modal opens
  useEffect(() => {
    if (isOpen && !templates && !isLoading && !error) {
      generateTemplates();
    }
  }, [isOpen]);

  const generateTemplates = async () => {
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
            mutation GenerateEmailTemplate(
              $contactId: String!
              $context: String
              $includeHistory: Boolean
            ) {
              generateEmailTemplate(
                contactId: $contactId
                context: $context
                includeHistory: $includeHistory
              ) {
                formal {
                  subject
                  body
                }
                casual {
                  subject
                  body
                }
              }
            }
          `,
          variables: {
            contactId,
            context: context || "",
            includeHistory: emailType === "followup",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate templates");
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setTemplates(data.data.generateEmailTemplate);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate templates. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleRegenerate = () => {
    setTemplates(null);
    generateTemplates();
  };

  const handleTryAgain = () => {
    setError(null);
    generateTemplates();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[1200px] w-[80vw] max-h-[90vh] overflow-y-auto
                      sm:max-w-[1200px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Generate AI Email Templates
          </DialogTitle>
          <DialogDescription>
            Choose between formal and casual email styles. AI will generate both
            templates based on your contact&apos;s profile and conversation
            history.
          </DialogDescription>
        </DialogHeader>

        {/* Error State */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4
                          flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">
                Failed to generate templates
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTryAgain}
              className="flex-shrink-0"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading or Template Display */}
        {!error && (
          <>
            {/* Desktop: Two-Column Grid Layout */}
            <div
              className="hidden md:grid md:grid-cols-2 gap-6"
              data-testid="template-grid"
            >
              {/* Template A (Formal) */}
              <div className="space-y-3">
                {isLoading ? (
                  <div data-testid="template-skeleton-a">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : templates ? (
                  <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Template A</span>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Formal
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Subject
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {templates.formal.subject}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Body Preview
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                          {templates.formal.body}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSelectTemplate(templates.formal)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Use Template A
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              {/* Vertical Divider */}
              <div className="absolute left-1/2 top-20 bottom-20 w-px bg-gray-200 -ml-3 hidden md:block" />

              {/* Template B (Casual) */}
              <div className="space-y-3">
                {isLoading ? (
                  <div data-testid="template-skeleton-b">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : templates ? (
                  <Card className="border-2 border-green-200 bg-green-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Template B</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Casual
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Subject
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {templates.casual.subject}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Body Preview
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                          {templates.casual.body}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSelectTemplate(templates.casual)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Use Template B
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>

            {/* Mobile: Tabs Layout */}
            <div className="md:hidden">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-8 w-32 mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : templates ? (
                <Tabs defaultValue="formal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="formal">
                      Template A (Formal)
                    </TabsTrigger>
                    <TabsTrigger value="casual">
                      Template B (Casual)
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="formal">
                    <Card className="border-2 border-blue-200 bg-blue-50/30">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Template A</span>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Formal
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Subject
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {templates.formal.subject}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Body Preview
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {templates.formal.body}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            handleSelectTemplate(templates.formal)
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Use Template A
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="casual">
                    <Card className="border-2 border-green-200 bg-green-50/30">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Template B</span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Casual
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Subject
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {templates.casual.subject}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Body Preview
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {templates.casual.body}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            handleSelectTemplate(templates.casual)
                          }
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Use Template B
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : null}
            </div>
          </>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          {templates && !error && (
            <Button
              onClick={handleRegenerate}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Regenerate Both Templates
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
