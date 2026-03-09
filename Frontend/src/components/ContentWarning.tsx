import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X, Check, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface ContentWarningProps {
  warning?: {
    type: 'harsh_language' | 'spam_indicators' | 'negative_sentiment' | 'suspicious_patterns' | 'formatting_issues' | 'manual_review';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    canBeAppealed?: boolean;
    warningId?: string;
  };
  onAcknowledge?: () => void;
  onAppeal?: (reason: string) => void;
  showDismiss?: boolean;
  variant?: 'inline' | 'modal' | 'banner';
}

interface AppealFormProps {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AppealForm: React.FC<AppealFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Appeal Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please explain why you believe this warning is incorrect..."
          className="w-full mt-1 p-2 border rounded-md resize-none h-24"
          required
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={!reason.trim() || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
        </Button>
      </div>
    </form>
  );
};

export const ContentWarning: React.FC<ContentWarningProps> = ({
  warning,
  onAcknowledge,
  onAppeal,
  showDismiss = true,
  variant = 'inline'
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  if (!warning || isDismissed) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleAcknowledge = () => {
    setIsDismissed(true);
    onAcknowledge?.();
  };

  const handleAppeal = async (reason: string) => {
    setIsSubmittingAppeal(true);
    try {
      await onAppeal?.(reason);
      setShowAppealForm(false);
      setIsDismissed(true);
    } catch (error) {
      console.error('Failed to submit appeal:', error);
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const warningContent = (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(warning.severity)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">Content Warning</span>
          <Badge variant="outline" className="text-xs">
            {warning.severity}
          </Badge>
        </div>
        <p className="text-sm">{warning.message}</p>
        
        <div className="flex gap-2 mt-3">
          {onAcknowledge && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAcknowledge}
              className="h-7 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Acknowledge
            </Button>
          )}
          
          {warning.canBeAppealed && onAppeal && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAppealForm(true)}
              className="h-7 text-xs"
            >
              Appeal
            </Button>
          )}
        </div>
      </div>

      {showDismiss && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAcknowledge}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  if (variant === 'modal') {
    return (
      <Dialog open={true} onOpenChange={handleAcknowledge}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon(warning.severity)}
              Content Warning
            </DialogTitle>
            <DialogDescription>
              Your content has been flagged by our AI moderation system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {warningContent}
            
            {showAppealForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Submit Appeal</h4>
                <AppealForm
                  onSubmit={handleAppeal}
                  onCancel={() => setShowAppealForm(false)}
                  isSubmitting={isSubmittingAppeal}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === 'banner') {
    return (
      <Alert className={`border-l-4 ${getSeverityColor(warning.severity)}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {getIcon(warning.severity)}
            <AlertDescription className="text-sm">
              {warning.message}
            </AlertDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {warning.canBeAppealed && onAppeal && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAppealForm(true)}
                className="h-7 text-xs"
              >
                Appeal
              </Button>
            )}
            {showDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAcknowledge}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {showAppealForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <AppealForm
              onSubmit={handleAppeal}
              onCancel={() => setShowAppealForm(false)}
              isSubmitting={isSubmittingAppeal}
            />
          </div>
        )}
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {warningContent}
      
      {showAppealForm && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium mb-3">Submit Appeal</h4>
            <AppealForm
              onSubmit={handleAppeal}
              onCancel={() => setShowAppealForm(false)}
              isSubmitting={isSubmittingAppeal}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Hook for real-time content checking
export const useContentChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [warning, setWarning] = useState<any>(null);

  const checkContent = async (content: string, contentType: string = 'comment') => {
    if (!content.trim()) return null;

    setIsChecking(true);
    try {
      const response = await fetch('/api/moderation/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content, contentType })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.warning) {
          setWarning({
            type: data.analysis.flags[0] || 'manual_review',
            severity: data.analysis.riskLevel === 'high' ? 'high' : 
                     data.analysis.riskLevel === 'medium' ? 'medium' : 'low',
            message: data.warning,
            canBeAppealed: true
          });
        }
        return data;
      }
    } catch (error) {
      console.error('Content check failed:', error);
    } finally {
      setIsChecking(false);
    }
    return null;
  };

  const clearWarning = () => {
    setWarning(null);
  };

  return {
    checkContent,
    isChecking,
    warning,
    clearWarning
  };
};

// Component for real-time content checking during input
export const ContentChecker: React.FC<{
  content: string;
  contentType?: string;
  onWarning?: (warning: any) => void;
}> = ({ content, contentType = 'comment', onWarning }) => {
  const { checkContent, isChecking, warning, clearWarning } = useContentChecker();

  useEffect(() => {
    if (content.trim()) {
      const debounceTimer = setTimeout(() => {
        checkContent(content, contentType);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(debounceTimer);
    } else {
      clearWarning();
    }
  }, [content, contentType]);

  useEffect(() => {
    if (warning && onWarning) {
      onWarning(warning);
    }
  }, [warning, onWarning]);

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-300"></div>
        Checking content...
      </div>
    );
  }

  if (warning) {
    return (
      <ContentWarning
        warning={warning}
        variant="inline"
        showDismiss={false}
      />
    );
  }

  return null;
};

export default ContentWarning;
