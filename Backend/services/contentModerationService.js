import Sentiment from 'sentiment';
import { removeStopwords, eng } from 'stopword';

class ContentModerationService {
    constructor() {
        this.sentiment = new Sentiment();
        
        // Harsh words and inappropriate content patterns
        this.harshWords = new Set([
            // Profanity
            'fuck', 'fucking', 'shit', 'bullshit', 'crap', 'damn', 'hell',
            'ass', 'asshole', 'bitch', 'bastard', 'dick', 'pussy', 'cunt',
            'whore', 'slut', 'idiot', 'stupid', 'moron', 'retard',
            
            // Hate speech
            'nigger', 'nigga', 'kike', 'spic', 'chink', 'gook', 'wetback',
            'terrorist', 'nazi', 'hitler', 'racist', 'sexist', 'homophobic',
            
            // Violence/Threats
            'kill', 'murder', 'rape', 'assault', 'attack', 'harm', 'hurt',
            'die', 'death', 'suicide', 'bomb', 'gun', 'weapon', 'threat',
            
            // Inappropriate content
            'porn', 'sex', 'nude', 'naked', 'xxx', 'adult', 'drugs',
            'cocaine', 'heroin', 'weed', 'marijuana', 'addict'
        ]);
        
        // Suspicious patterns
        this.suspiciousPatterns = [
            /\b\d{1,3}[-.]?\d{1,3}[-.]?\d{1,3}[-.]?\d{1,3}\b/g, // IP addresses
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
            /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/g, // URLs
            /\$\d+(?:,\d{3})*(?:\.\d{2})?/g, // Money amounts
            /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN pattern
        ];
    }

    // Main content analysis function
    analyzeContent(text, contentType = 'comment') {
        const analysis = {
            isAppropriate: true,
            riskLevel: 'low',
            flags: [],
            score: 0,
            warning: null,
            requiresModeration: false,
            detectedIssues: []
        };

        if (!text || typeof text !== 'string') {
            return analysis;
        }

        const cleanText = text.toLowerCase().trim();
        
        // 1. Check for harsh words
        const wordAnalysis = this.checkHarshWords(cleanText);
        if (wordAnalysis.hasHarshWords) {
            analysis.isAppropriate = false;
            analysis.flags.push('harsh_language');
            analysis.detectedIssues.push(...wordAnalysis.detectedWords);
            analysis.score += wordAnalysis.severity * 20;
        }

        // 2. Check for suspicious patterns
        const patternAnalysis = this.checkSuspiciousPatterns(text);
        if (patternAnalysis.hasSuspiciousPatterns) {
            analysis.flags.push('suspicious_patterns');
            analysis.detectedIssues.push(...patternAnalysis.detectedPatterns);
            analysis.score += 15;
        }

        // 3. Sentiment analysis
        const sentimentAnalysis = this.sentiment.analyze(text);
        if (sentimentAnalysis.score < -3) {
            analysis.flags.push('negative_sentiment');
            analysis.score += Math.abs(sentimentAnalysis.score) * 2;
        }

        // 4. Check for spam characteristics
        const spamAnalysis = this.checkSpamCharacteristics(text);
        if (spamAnalysis.isSpam) {
            analysis.flags.push('spam_indicators');
            analysis.score += spamAnalysis.spamScore;
        }

        // 5. Check for excessive caps or special characters
        const formattingAnalysis = this.checkFormattingIssues(text);
        if (formattingAnalysis.hasIssues) {
            analysis.flags.push('formatting_issues');
            analysis.score += formattingAnalysis.severity;
        }

        // Determine risk level and moderation requirements
        analysis.riskLevel = this.calculateRiskLevel(analysis.score);
        analysis.requiresModeration = analysis.score >= 15; // Lowered threshold from 30 to 15
        analysis.warning = this.generateWarning(analysis);

        return analysis;
    }

    // Check for harsh words
    checkHarshWords(text) {
        const words = text.split(/\s+/);
        const detectedWords = [];
        let severity = 0;

        words.forEach(word => {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '');
            if (this.harshWords.has(cleanWord)) {
                detectedWords.push(cleanWord);
                severity += this.getWordSeverity(cleanWord);
            }
        });

        return {
            hasHarshWords: detectedWords.length > 0,
            detectedWords,
            severity
        };
    }

    // Check for suspicious patterns
    checkSuspiciousPatterns(text) {
        const detectedPatterns = [];
        
        this.suspiciousPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                detectedPatterns.push(...matches);
            }
        });

        return {
            hasSuspiciousPatterns: detectedPatterns.length > 0,
            detectedPatterns
        };
    }

    // Check for spam characteristics
    checkSpamCharacteristics(text) {
        let spamScore = 0;
        const spamIndicators = [];

        // Excessive repetition
        if (/(.)\1{4,}/.test(text)) {
            spamScore += 10;
            spamIndicators.push('excessive_repetition');
        }

        // Too many links
        const linkCount = (text.match(/https?:\/\//g) || []).length;
        if (linkCount > 2) {
            spamScore += linkCount * 5;
            spamIndicators.push('too_many_links');
        }

        // All caps
        if (text === text.toUpperCase() && text.length > 10) {
            spamScore += 8;
            spamIndicators.push('all_caps');
        }

        // Random character sequences
        if (/[a-zA-Z]{20,}/.test(text)) {
            spamScore += 15;
            spamIndicators.push('long_word_sequence');
        }

        return {
            isSpam: spamScore > 15,
            spamScore,
            indicators: spamIndicators
        };
    }

    // Check formatting issues
    checkFormattingIssues(text) {
        let severity = 0;
        const issues = [];

        // Excessive special characters
        const specialCharCount = (text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
        if (specialCharCount > text.length * 0.3) {
            severity += 10;
            issues.push('excessive_special_chars');
        }

        // Excessive whitespace
        if (/\s{5,}/.test(text)) {
            severity += 5;
            issues.push('excessive_whitespace');
        }

        return {
            hasIssues: issues.length > 0,
            severity,
            issues
        };
    }

    // Get severity level for specific words
    getWordSeverity(word) {
        const severeWords = ['fuck', 'cunt', 'nigger', 'kill', 'rape', 'murder'];
        const moderateWords = ['shit', 'asshole', 'bitch', 'bastard', 'damn'];
        
        if (severeWords.includes(word)) return 3;
        if (moderateWords.includes(word)) return 2;
        return 1;
    }

    // Calculate risk level based on score
    calculateRiskLevel(score) {
        if (score >= 50) return 'high';
        if (score >= 30) return 'medium';
        if (score >= 15) return 'low';
        return 'minimal';
    }

    // Generate appropriate warning message
    generateWarning(analysis) {
        if (analysis.score < 15) return null;

        const warnings = {
            harsh_language: "Please keep your comments respectful and avoid using inappropriate language.",
            suspicious_patterns: "Your comment contains content that may be suspicious or unsafe.",
            negative_sentiment: "Please maintain a positive and constructive tone in your comments.",
            spam_indicators: "Your comment appears to be spam-like. Please avoid repetitive or promotional content.",
            formatting_issues: "Please format your comment appropriately for better readability."
        };

        const primaryFlag = analysis.flags[0];
        return warnings[primaryFlag] || "Your comment may contain inappropriate content. Please review and revise.";
    }

    // Auto-flag content for moderation
    async flagContent(contentId, contentType, analysis, userId) {
        const flag = {
            contentId,
            contentType,
            userId,
            flags: analysis.flags,
            riskLevel: analysis.riskLevel,
            score: analysis.score,
            detectedIssues: analysis.detectedIssues,
            status: 'pending',
            createdAt: new Date(),
            autoFlagged: true
        };

        // This would be saved to a moderation queue collection
        return flag;
    }

    // Generate user-friendly warning
    generateUserWarning(analysis) {
        const baseMessage = "⚠️ Content Warning: ";
        
        if (analysis.riskLevel === 'high') {
            return baseMessage + "This content has been flagged for serious policy violations and is under review.";
        } else if (analysis.riskLevel === 'medium') {
            return baseMessage + "This content may violate our community guidelines and is being reviewed.";
        } else {
            return baseMessage + analysis.warning;
        }
    }
}

export default new ContentModerationService();
