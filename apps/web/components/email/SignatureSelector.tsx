"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pen } from "lucide-react";

/**
 * Email Signature Selector Component
 *
 * Features:
 * - Dropdown with all user signatures
 * - Auto-selection based on context (formal/casual)
 * - Manual signature switching
 * - Signature preview on hover
 * - Accessibility support
 * - Default signature indicators
 *
 * @param signatures - List of user's email signatures
 * @param selectedSignatureId - Currently selected signature ID
 * @param onChange - Callback when signature selection changes
 * @param context - Email context for auto-selection (formal/casual)
 * @param autoSelect - Enable auto-selection based on context
 * @param disabled - Disable signature selection
 */

export interface EmailSignature {
  id: string;
  name: string;
  contentJson: Record<string, any>;
  contentHtml: string;
  isDefaultForFormal: boolean;
  isDefaultForCasual: boolean;
  isGlobalDefault: boolean;
}

interface SignatureSelectorProps {
  signatures: EmailSignature[];
  selectedSignatureId: string | null | undefined;
  onChange: (signatureId: string | null) => void;
  context?: "formal" | "casual";
  autoSelect?: boolean;
  disabled?: boolean;
}

export function SignatureSelector({
  signatures,
  selectedSignatureId,
  onChange,
  context,
  autoSelect = false,
  disabled = false,
}: SignatureSelectorProps) {
  const [hoveredSignatureId, setHoveredSignatureId] = useState<string | null>(
    null
  );

  /**
   * Auto-select signature based on context
   */
  useEffect(() => {
    if (!autoSelect || selectedSignatureId || signatures.length === 0) {
      return;
    }

    let defaultSignature: EmailSignature | undefined;

    // 1. Try context-specific default
    if (context === "formal") {
      defaultSignature = signatures.find((sig) => sig.isDefaultForFormal);
    } else if (context === "casual") {
      defaultSignature = signatures.find((sig) => sig.isDefaultForCasual);
    }

    // 2. Fallback to global default
    if (!defaultSignature) {
      defaultSignature = signatures.find((sig) => sig.isGlobalDefault);
    }

    // 3. Auto-select if found
    if (defaultSignature) {
      onChange(defaultSignature.id);
    }
  }, [autoSelect, selectedSignatureId, signatures, context, onChange]);

  /**
   * Get signature badge text
   */
  const getSignatureBadge = (signature: EmailSignature): string | null => {
    if (signature.isGlobalDefault) return "Global Default";
    if (signature.isDefaultForFormal) return "Default for Formal";
    if (signature.isDefaultForCasual) return "Default for Casual";
    return null;
  };

  /**
   * Get hovered signature for preview
   */
  const hoveredSignature = signatures.find(
    (sig) => sig.id === hoveredSignatureId
  );

  /**
   * Validate and normalize selected ID
   */
  const normalizedSelectedId = signatures.find(
    (sig) => sig.id === selectedSignatureId
  )
    ? selectedSignatureId
    : null;

  return (
    <div className="space-y-2">
      <Select
        value={normalizedSelectedId || "none"}
        onValueChange={(value) => onChange(value === "none" ? null : value)}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Select signature"
          className="w-full"
        >
          <SelectValue placeholder="Select signature">
            {normalizedSelectedId ? (
              <div className="flex items-center gap-2">
                <Pen className="h-4 w-4 text-gray-500" />
                {signatures.find((sig) => sig.id === normalizedSelectedId)
                  ?.name || "No Signature"}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Pen className="h-4 w-4 text-gray-500" />
                No Signature
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {/* No Signature Option */}
          <SelectItem value="none">No Signature</SelectItem>

          {/* Empty State */}
          {signatures.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-gray-500">
              No signatures found
            </div>
          )}

          {/* Signature Options */}
          {signatures.map((signature) => {
            const badge = getSignatureBadge(signature);

            return (
              <SelectItem
                key={signature.id}
                value={signature.id}
                onMouseEnter={() => setHoveredSignatureId(signature.id)}
                onMouseLeave={() => setHoveredSignatureId(null)}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span>{signature.name}</span>
                  {badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Signature Preview on Hover */}
      {hoveredSignature && (
        <div
          className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          role="tooltip"
        >
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview:
          </p>
          {hoveredSignature.contentHtml ? (
            <div
              className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: hoveredSignature.contentHtml }}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-500 italic">
              No preview available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
