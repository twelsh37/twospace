"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, comment: string) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  loading?: boolean;
}

const REASONS = ["Recycled", "Irreparable", "Obsolete", "Other"];

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm Deletion",
  description = "This action cannot be undone. Please select a reason for deletion.",
  confirmText = "confirm deletion",
  loading = false,
}: ConfirmDeleteModalProps) {
  const [input, setInput] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    if (input === confirmText && reason && (reason !== "Other" || comment)) {
      onConfirm(reason, reason === "Other" ? comment : "");
      setInput("");
      setReason("");
      setComment("");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setInput("");
      setReason("");
      setComment("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="delete-reason">Reason for deletion</Label>
            <select
              id="delete-reason"
              className="w-full border rounded p-2 mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a reason...</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {reason === "Other" && (
            <div>
              <Label htmlFor="delete-comment">Comment</Label>
              <Input
                id="delete-comment"
                placeholder="Enter reason for deletion"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
          <Input
            placeholder={`Type '${confirmText}' to enable delete`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={
                input !== confirmText ||
                !reason ||
                (reason === "Other" && !comment) ||
                loading
              }
              onClick={handleConfirm}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
