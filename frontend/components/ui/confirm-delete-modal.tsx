// frontend/components/ui/confirm-delete-modal.tsx

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
      <DialogContent className="max-w-md" hideClose={true}>
        <DialogTitle asChild>
          <VisuallyHidden>{title}</VisuallyHidden>
        </DialogTitle>
        <Card className="shadow-lg border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="delete-reason">Reason for deletion</Label>
                <Select
                  value={reason}
                  onValueChange={setReason}
                  disabled={loading}
                >
                  <SelectTrigger id="delete-reason" className="w-full mt-1">
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-2">
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
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
