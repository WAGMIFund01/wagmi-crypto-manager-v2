import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Alternative AI providers for when OpenAI quota is exceeded
const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude'
} as const;

export interface AIConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ReportContext {
  previousReports: string[];
  currentPortfolioData?: any;
  newDetails?: string;
}

export interface AIGenerateReportRequest {
  context: ReportContext;
  conversationHistory: AIConversationMessage[];
  newDetails?: string;
  provider?: 'openai' | 'gemini' | 'claude';
}

export interface AIGenerateReportResponse {
  success: boolean;
  draft?: string;
  followUpQuestions?: string[];
  error?: string;
  provider?: string;
}

class AIService {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private currentProvider: string = AI_PROVIDERS.GEMINI; // Default to Gemini

  constructor() {
    // Initialize Gemini if available (preferred, free tier)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.currentProvider = AI_PROVIDERS.GEMINI;
    }
    // Fallback to OpenAI if Gemini not available
    else if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.currentProvider = AI_PROVIDERS.OPENAI;
    }
  }

  private getSystemPrompt(): string {
    return `You are an AI assistant specialized in generating WAGMI Fund investor updates. Your mission is to embody the voice of a seasoned, conviction-driven crypto fund manager who blends professional clarity with subtle flair.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SIGNATURE VOICE & TONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Adopt a CONFIDENT, INVESTOR-SAVVY tone:
- Part macro strategist, part DeFi-native PM, part fintech newsletter
- Use tight, well-weighted phrasing — not too verbose, but not sterile
- Signature phrases: "we remain comfortable with," "the macro backdrop continues to tilt," "we are not looking to deploy funds into new tokens at the moment"
- Show HIGH CONVICTION without hype
- Professional clarity with subtle flair

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PORTFOLIO DATA (REAL & COMPLETE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You receive REAL, COMPLETE portfolio data:
- Total portfolio value (actual AUM)
- Significant holdings (>5%) with full thesis, value, %, 24h changes
- Minor holdings (<5%) with basic details
- Allocation breakdowns by risk/chain/type

USE THIS DATA DIRECTLY - DO NOT question completeness.
Calculate performance from 24h changes. Report actual numbers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 REPORT STRUCTURE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WAGMI Fund Update
[Month Year]
______________________________

**Executive Summary**
[2-3 tight paragraphs]
• Current AUM (with % change since last report)
• Key contributors to performance this period
• Macro highlights (numbered: (1), (2), (3))
• Recent portfolio moves/reinforcement of strategy

**Macro Overview**
[1-2 paragraphs]
• 2-3 key macro themes (regulation, institutional adoption, L1/L2 flows, etc.)
• Tie DIRECTLY to fund positioning
• Forward-looking opportunity (e.g., "ETH treasury companies creating structural demand")
• Use cause-effect framing: "Due to [driver], we [action]"

**Our Picks — Update on positioning**
[Intro paragraph establishing conviction stance]

Focus on high-conviction assets (>5% of portfolio):
• **[Token Name]** ([% of portfolio], [value]): [Brief thesis update + performance note + any allocation changes like DCA/LP activity]
• **[Token Name]** ([% of portfolio], [value]): [Same format]
[Continue for each significant holding]

[Wrap with minor holdings summary in one sentence]

**Portfolio Performance**
• Quantify recent performance (24h, MTD, MoM as available)
• Benchmark vs Total/Total-3 if data available
• Attribution: Which tokens drove gains/drags
• Use specific percentages: "delivered +X% net return"
• Compare to prior periods: "continues a strong three-month stretch"

**Path ahead**
[1-2 paragraphs]
• Forward strategy with conviction language
• Priorities: "Our priority is to begin profit-taking on [asset]"
• Strategic patience: "We are exploring [area] but remain disciplined"
• Areas under watch: "We expect to scale [position] as [condition]"
• Subtle anticipation: "We are watching [asset] closely as it approaches..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️ WRITING STYLE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VOICE REQUIREMENTS:
✓ First-person plural ("we," "our") — active, confident
✓ Tight, efficient sentences with strategic weight
✓ Concrete numbers and percentages throughout
✓ Transparent about wins AND challenges
✓ Forward-looking, conviction-driven, not momentum-chasing

NARRATIVE DEVICES:
✓ Cause-effect framing: "Due to X, we Y"
✓ Strategic patience: "We remain comfortable with our picks"
✓ Selectivity emphasis: "We are not looking to deploy into new tokens"
✓ Anticipation building: "We are evaluating opportunities as they emerge"

FORMATTING:
✓ Use markdown bold for section headers: **Executive Summary**
✓ Numbered macro highlights: (1), (2), (3)
✓ Parenthetical context: (+50% cumulatively), (~11% APY)
✓ Dollar formatting: $27K or $27,000
✓ Bullet points (•) for portfolio moves
✓ Underscores after title: ______________________________

PHRASES TO EMULATE:
• "we remain comfortable with"
• "the macro backdrop continues to tilt"
• "we are not looking to deploy funds into new tokens at the moment"
• "we lean into"
• "our priority is to begin profit-taking"
• "we are exploring X but remain disciplined"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ WHEN TO ASK FOLLOW-UP QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ONLY ask for qualitative inputs NOT in portfolio data:
• Recent regulatory/macro/ecosystem events that influenced strategy
• Non-obvious strategy shifts or DCA moves not captured in data
• Forward-looking plays, narratives being scaled into or de-risked
• New positions not yet reflected (e.g., new LP positions, wallets)
• Specific strategic decisions made this period
• Risk management actions taken

DO NOT ASK about data already provided (values, percentages, theses).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate investor updates that read like they came from an experienced, conviction-driven fund manager. Match the uploaded report style EXACTLY. Maintain house voice throughout.`;
  }

  async generateReportDraft(request: AIGenerateReportRequest): Promise<AIGenerateReportResponse> {
    // Use requested provider or fall back to default
    const provider = request.provider || this.currentProvider;

    // Route to appropriate provider
    if (provider === AI_PROVIDERS.GEMINI && this.gemini) {
      return await this.generateWithGemini(request);
    } else if (provider === AI_PROVIDERS.OPENAI && this.openai) {
      return await this.generateWithOpenAI(request);
    }

    // No provider available
    return {
      success: false,
      error: `${provider} API key not configured. Please add the API key to your environment variables.`,
      provider
    };
  }

  private async generateWithGemini(request: AIGenerateReportRequest): Promise<AIGenerateReportResponse> {
    if (!this.gemini) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        provider: 'gemini'
      };
    }

    try {
      // Using Gemini 2.5 Flash (stable version, free tier)
      const model = this.gemini.getGenerativeModel({ 
        model: 'models/gemini-2.5-flash'
      });

      // Build comprehensive prompt
      let prompt = this.getSystemPrompt() + '\n\n';

      // Add conversation history (limit to last 15 messages to save tokens)
      if (request.conversationHistory.length > 0) {
        prompt += 'Previous conversation (includes all feedback and discussions):\n';
        const recentMessages = request.conversationHistory.slice(-15); // Last 15 messages
        recentMessages.forEach(msg => {
          if (msg.role !== 'system') {
            // Only truncate extremely long messages (>2000 chars) to preserve feedback details
            const content = msg.content.length > 2000 
              ? msg.content.substring(0, 2000) + '... [truncated]'
              : msg.content;
            prompt += `${msg.role}: ${content}\n`;
          }
        });
        prompt += '\n';
      }

      // Add previous reports context (summarized to avoid token limits)
      if (request.context.previousReports.length > 0) {
        const originalLength = request.context.previousReports.join('').length;
        const summarizedReports = this.summarizeReports(request.context.previousReports);
        console.log(`📊 Reports summarized: ${originalLength} → ${summarizedReports.length} chars (${Math.round(summarizedReports.length/4)} tokens)`);
        prompt += `Previous investor reports for reference (style and structure):\n${summarizedReports}\n\n`;
      }

      // Add current portfolio data (summarized to save tokens)
      if (request.context.currentPortfolioData) {
        const portfolioSummary = this.summarizePortfolioData(request.context.currentPortfolioData);
        console.log(`📊 Portfolio summary generated: ~${Math.round(portfolioSummary.length/4)} tokens`);
        console.log(`📊 First 500 chars of summary:\n${portfolioSummary.substring(0, 500)}`);
        prompt += `CURRENT PORTFOLIO DATA (THIS IS REAL DATA - USE IT AS-IS):\n\n`;
        prompt += portfolioSummary + '\n\n';
        prompt += `IMPORTANT: The totalValue shown above is the ACTUAL current portfolio value. All values, percentages, and changes are REAL numbers from live data. Do NOT say the portfolio value is $0.00 or that data is missing.\n\n`;
      }

      // Add new details
      if (request.newDetails) {
        prompt += `New details for this report: ${request.newDetails}\n\n`;
      }

      // Request generation
      prompt += `TASK: Generate a professional draft investor report based on the provided context.

CRITICAL INSTRUCTIONS:
1. If there is a "Previous conversation" section above, READ IT CAREFULLY
2. Incorporate ALL feedback, suggestions, and discussions from the conversation
3. The conversation shows what the user wants added, changed, or emphasized
4. Apply those changes directly to the report - don't just acknowledge them
5. If you need more information to create a comprehensive report, ask specific follow-up questions at the end.

Generate the full, updated report now:`;

      console.log(`🔍 Total prompt length: ${prompt.length} chars (~${Math.round(prompt.length/4)} tokens)`);

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Extract follow-up questions and draft
      const followUpQuestions = this.extractFollowUpQuestions(response);
      const draft = this.extractDraftReport(response);

      return {
        success: true,
        draft,
        followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        provider: 'gemini'
      };

    } catch (error) {
      console.error('Gemini service error:', error);
      
      // Handle specific Gemini errors
      if (error instanceof Error) {
        return {
          success: false,
          error: `Gemini API error: ${error.message}`,
          provider: 'gemini'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        provider: 'gemini'
      };
    }
  }

  private async generateWithOpenAI(request: AIGenerateReportRequest): Promise<AIGenerateReportResponse> {
    if (!this.openai) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
        provider: 'openai'
      };
    }

    try {
      const messages: AIConversationMessage[] = [
        { role: 'system', content: this.getSystemPrompt() },
        ...request.conversationHistory,
      ];

      // Add context about previous reports
      if (request.context.previousReports.length > 0) {
        messages.push({
          role: 'user',
          content: `Here are the previous investor reports for context:\n\n${request.context.previousReports.join('\n\n---\n\n')}`
        });
      }

      // Add current portfolio context if available
      if (request.context.currentPortfolioData) {
        messages.push({
          role: 'user',
          content: `Current portfolio data: ${JSON.stringify(request.context.currentPortfolioData, null, 2)}`
        });
      }

      // Add new details if provided
      if (request.newDetails) {
        messages.push({
          role: 'user',
          content: `New details for this report: ${request.newDetails}`
        });
      }

      // Request the report generation
      messages.push({
        role: 'user',
        content: 'Please generate a draft investor report based on the provided context. If you need more information to create a comprehensive report, please ask specific follow-up questions.'
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Check if the response contains follow-up questions
      const followUpQuestions = this.extractFollowUpQuestions(response);
      const draft = this.extractDraftReport(response);

      return {
        success: true,
        draft,
        followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        provider: 'openai'
      };

    } catch (error) {
      console.error('OpenAI service error:', error);
      
      // Handle specific OpenAI quota errors with clear messaging
      if (error instanceof Error && error.message.includes('429')) {
        return {
          success: false,
          error: 'OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/usage or try again later.',
          provider: 'openai'
        };
      }
      
      // Handle other OpenAI API errors
      if (error instanceof Error && error.message.includes('OpenAI')) {
        return {
          success: false,
          error: `OpenAI API error: ${error.message}`,
          provider: 'openai'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        provider: 'openai'
      };
    }
  }

  async askFollowUpQuestion(
    question: string, 
    context: ReportContext, 
    provider?: 'openai' | 'gemini' | 'claude',
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIGenerateReportResponse> {
    // This method handles conversational questions and feedback - NOT full report generation
    // It should respond conversationally about changes, not output full reports
    
    if (!this.gemini) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        provider: 'gemini'
      };
    }

    try {
      const model = this.gemini.getGenerativeModel({ 
        model: 'models/gemini-2.5-flash'
      });

      // Build a conversational prompt focused on discussing changes, not generating full reports
      let prompt = `You are an AI assistant helping to refine an investor report for the WAGMI Fund.

IMPORTANT RULES:
1. NEVER output a full report in chat - only discuss specific changes, additions, or edits
2. When the user asks for changes (e.g., "add commentary on X"), provide ONLY the new content/section you would add
3. Explain WHERE in the report you would place this new content (e.g., "I would add this to the Macro Overview section, right after the discussion on...")
4. Keep responses focused and conversational - show the specific paragraph or section
5. DO NOT ask the user to confirm - they will type "refresh draft" or "regenerate report" when ready
6. DO NOT include the entire report in your response - ONLY the specific new/changed content
7. Format proposed content clearly (use markdown, bullets, or clear paragraph breaks)
8. When user asks for changes, provide them and note: "When you're ready, just say 'refresh draft' to apply these changes."

Current portfolio context summary:
${this.summarizePortfolioData(context.currentPortfolioData)}
`;

      // Add conversation history for context
      if (conversationHistory && conversationHistory.length > 0) {
        prompt += '\n\nPrevious conversation:\n';
        const recentMessages = conversationHistory.slice(-6); // Last 6 messages for context
        recentMessages.forEach(msg => {
          if (msg.role !== 'system') {
            prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 300)}${msg.content.length > 300 ? '...' : ''}\n`;
          }
        });
      }

      prompt += `\n\nUser's current question/feedback: ${question}

Respond conversationally. If they're asking for additions/changes, show ONLY the specific new content and where it goes. Keep it focused and helpful.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        draft: text,
        provider: 'gemini'
      };

    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'gemini'
      };
    }
  }

  // Get list of available providers
  getAvailableProviders(): Array<{ id: string; name: string; available: boolean; isFree: boolean }> {
    return [
      {
        id: 'gemini',
        name: 'Google Gemini',
        available: !!this.gemini,
        isFree: true
      },
      {
        id: 'openai',
        name: 'OpenAI GPT',
        available: !!this.openai,
        isFree: false
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        available: false, // Not yet implemented
        isFree: false
      }
    ];
  }

  // Get current default provider
  getCurrentProvider(): string {
    return this.currentProvider;
  }

  private summarizeReports(reports: string[]): string {
    // Summarize reports to extract key style, structure, and tone without full content
    return reports.map((report, index) => {
      // Truncate very long reports to avoid token limits
      const maxLength = 2000; // ~500 tokens per report
      const truncatedReport = report.length > maxLength 
        ? report.substring(0, maxLength) + '...\n[Report truncated for brevity]'
        : report;
      
      // Extract key sections (headers, bullet points, etc.)
      const lines = truncatedReport.split('\n');
      const keyLines = lines.filter(line => {
        const trimmed = line.trim();
        return (
          trimmed.startsWith('#') || // Headers
          trimmed.startsWith('**') || // Bold text
          trimmed.startsWith('*') || // Bullet points
          trimmed.startsWith('-') || // List items
          trimmed.length < 100 // Short, impactful lines
        );
      });
      
      // If we filtered too much, include a sample of regular lines
      if (keyLines.length < 10) {
        return `Report ${index + 1} structure:\n${truncatedReport}`;
      }
      
      return `Report ${index + 1} structure (key elements):\n${keyLines.join('\n')}`;
    }).join('\n\n---\n\n');
  }

  private summarizePortfolioData(portfolioData: any): string {
    // Summarize portfolio data to reduce token usage while keeping key details
    const assets = portfolioData.assets || [];
    const kpiMetrics = portfolioData.kpiMetrics;
    const performanceMetrics = portfolioData.performanceMetrics;
    const totalValue = assets.reduce((sum: number, asset: any) => sum + (asset.totalValue || 0), 0);
    
    // Sort by value descending
    const sortedAssets = assets
      .sort((a: any, b: any) => (b.totalValue || 0) - (a.totalValue || 0));
    
    // Get holdings that are >5% of portfolio value (focus on material positions)
    const significanceThreshold = totalValue * 0.05; // 5% threshold
    const significantHoldings = [];
    const minorHoldings = [];
    
    for (const asset of sortedAssets) {
      if (asset.totalValue >= significanceThreshold) {
        significantHoldings.push(asset);
      } else {
        minorHoldings.push(asset);
      }
    }
    
    // Create detailed holding entries with FULL thesis for significant holdings
    const detailedHoldings = significantHoldings.map((asset: any) => {
      const pct = ((asset.totalValue / totalValue) * 100).toFixed(2);
      return {
        name: asset.assetName,
        symbol: asset.symbol,
        location: asset.location,
        value: asset.totalValue?.toFixed(2),
        percentOfPortfolio: parseFloat(pct),
        change24h: asset.priceChange24h?.toFixed(2),
        chain: asset.chain,
        riskLevel: asset.riskLevel,
        coinType: asset.coinType,
        quantity: asset.quantity,
        currentPrice: asset.currentPrice,
        thesis: asset.thesis || 'No thesis provided'
      };
    });
    
    // Summarize minor holdings by category
    const minorHoldingsValue = minorHoldings.reduce((sum, a) => sum + (a.totalValue || 0), 0);
    const minorHoldingsSummary = minorHoldings.map((asset: any) => ({
      name: asset.assetName,
      symbol: asset.symbol,
      value: asset.totalValue?.toFixed(2),
      percentOfPortfolio: ((asset.totalValue / totalValue) * 100).toFixed(2),
      change24h: asset.priceChange24h?.toFixed(2),
      chain: asset.chain,
      riskLevel: asset.riskLevel
    }));
    
    // Calculate allocation summaries
    const byRisk = this.groupByField(assets, 'riskLevel');
    const byChain = this.groupByField(assets, 'chain');
    const byCoinType = this.groupByField(assets, 'coinType');
    
    // Convert to percentages for readability
    const byRiskPercent: Record<string, string> = {};
    Object.entries(byRisk).forEach(([key, value]) => {
      byRiskPercent[key] = `${((value / totalValue) * 100).toFixed(1)}% ($${value.toFixed(2)})`;
    });
    
    const byChainPercent: Record<string, string> = {};
    Object.entries(byChain).forEach(([key, value]) => {
      byChainPercent[key] = `${((value / totalValue) * 100).toFixed(1)}% ($${value.toFixed(2)})`;
    });
    
    // Format as readable text instead of JSON for better AI comprehension
    let summary = `PORTFOLIO OVERVIEW:
Total Assets: ${assets.length}
Total Portfolio Value: $${totalValue.toFixed(2)}
Significant Holdings (>5%): ${significantHoldings.length} positions
Minor Holdings (<5%): ${minorHoldings.length} positions
Minor Holdings Total Value: $${minorHoldingsValue.toFixed(2)}

FUND PERFORMANCE METRICS (KPI Data):`;

    if (kpiMetrics) {
      summary += `
Total Investors: ${kpiMetrics.totalInvestors}
Total Invested: $${kpiMetrics.totalInvested?.toLocaleString()}
Total AUM: $${kpiMetrics.totalAUM?.toLocaleString()}
Cumulative Return: ${kpiMetrics.cumulativeReturn?.toFixed(2)}%
Monthly Return (MoM): ${kpiMetrics.monthlyReturn?.toFixed(2)}%
Last Updated: ${kpiMetrics.lastUpdated}
`;
    } else {
      summary += `
(KPI metrics not available for this report)
`;
    }

    summary += `
PERFORMANCE VS BENCHMARKS (Historical Data):`;

    if (performanceMetrics && performanceMetrics.latest) {
      const latest = performanceMetrics.latest;
      summary += `

LATEST MONTH (${latest.month}):
- WAGMI Fund MoM Return: ${latest.wagmiMoM?.toFixed(2)}%
- Total Benchmark MoM: ${latest.totalMoM?.toFixed(2)}%
- Total-3 Benchmark MoM: ${latest.total3MoM?.toFixed(2)}%
- WAGMI Outperformance vs Total: ${latest.outperformanceMoM.vsTotal > 0 ? '+' : ''}${latest.outperformanceMoM.vsTotal?.toFixed(2)} pp
- WAGMI Outperformance vs Total-3: ${latest.outperformanceMoM.vsTotal3 > 0 ? '+' : ''}${latest.outperformanceMoM.vsTotal3?.toFixed(2)} pp

CUMULATIVE PERFORMANCE (Since Inception):
- WAGMI Fund: ${latest.wagmiCumulative?.toFixed(2)}%
- Total Benchmark: ${latest.totalCumulative?.toFixed(2)}%
- Total-3 Benchmark: ${latest.total3Cumulative?.toFixed(2)}%
- WAGMI Outperformance vs Total: ${latest.outperformanceCumulative.vsTotal > 0 ? '+' : ''}${latest.outperformanceCumulative.vsTotal?.toFixed(2)} pp
- WAGMI Outperformance vs Total-3: ${latest.outperformanceCumulative.vsTotal3 > 0 ? '+' : ''}${latest.outperformanceCumulative.vsTotal3?.toFixed(2)} pp

RECENT 3-MONTH TREND:`;
      
      performanceMetrics.recentHistory.forEach((month: any) => {
        summary += `
  ${month.month}: WAGMI ${month.wagmiMoM?.toFixed(2)}% | Total ${month.totalMoM?.toFixed(2)}% | Total-3 ${month.total3MoM?.toFixed(2)}%`;
      });

      summary += `

BENCHMARK DEFINITIONS:
- "Total" = Total crypto market cap weighted performance (all cryptocurrencies)
- "Total-3" = Top 3 cryptos by market cap (typically BTC, ETH, and third largest like SOL or BNB)
- Use these figures to show how WAGMI fund performed vs the broader market
- "pp" means percentage points (e.g., if WAGMI is +28% and Total is +16%, outperformance is +12 pp)
`;
    } else {
      summary += `
(Benchmark performance data not available for this report)
`;
    }

    summary += `
SIGNIFICANT HOLDINGS (>5% of portfolio, with full thesis):
`;

    detailedHoldings.forEach((holding, idx) => {
      summary += `
${idx + 1}. ${holding.name} (${holding.symbol})
   Value: $${holding.value}
   Percentage of Portfolio: ${holding.percentOfPortfolio}%
   24h Change: ${holding.change24h}%
   Chain: ${holding.chain}
   Risk Level: ${holding.riskLevel}
   Coin Type: ${holding.coinType}
   Location: ${holding.location}
   Quantity: ${holding.quantity}
   Current Price: $${holding.currentPrice}
   Investment Thesis: ${holding.thesis}
`;
    });

    if (minorHoldingsSummary.length > 0) {
      summary += `\nMINOR HOLDINGS (<5% of portfolio, basic details):
`;
      minorHoldingsSummary.forEach((holding, idx) => {
        summary += `${idx + 1}. ${holding.name} (${holding.symbol}) - $${holding.value} (${holding.percentOfPortfolio}% of portfolio), 24h: ${holding.change24h}%, Chain: ${holding.chain}, Risk: ${holding.riskLevel}\n`;
      });
    }

    summary += `\nPORTFOLIO ALLOCATION BY RISK LEVEL:
`;
    Object.entries(byRiskPercent).forEach(([risk, allocation]) => {
      summary += `${risk}: ${allocation}\n`;
    });

    summary += `\nPORTFOLIO ALLOCATION BY BLOCKCHAIN:
`;
    Object.entries(byChainPercent).forEach(([chain, allocation]) => {
      summary += `${chain}: ${allocation}\n`;
    });

    summary += `\nPORTFOLIO ALLOCATION BY COIN TYPE:
`;
    Object.entries(byCoinType).forEach(([type, value]) => {
      const pct = ((value / totalValue) * 100).toFixed(1);
      summary += `${type}: ${pct}% ($${value.toFixed(2)})\n`;
    });
    
    return summary;
  }

  private groupByField(assets: any[], field: string): Record<string, number> {
    return assets.reduce((acc: Record<string, number>, asset: any) => {
      const key = asset[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + (asset.totalValue || 0);
      return acc;
    }, {});
  }

  private extractFollowUpQuestions(response: string): string[] {
    const questions: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('?') && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./))) {
        questions.push(trimmed.replace(/^[-•\d\.\s]+/, '').trim());
      }
    }
    
    return questions;
  }

  private extractDraftReport(response: string): string {
    // Look for report content, excluding follow-up questions
    const lines = response.split('\n');
    const reportLines: string[] = [];
    let inReportSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip follow-up question sections
      if (trimmed.includes('follow-up') || trimmed.includes('questions') || trimmed.includes('clarification')) {
        continue;
      }
      
      // Start collecting report content
      if (trimmed.length > 0 && !trimmed.includes('?')) {
        inReportSection = true;
      }
      
      if (inReportSection) {
        reportLines.push(line);
      }
    }
    
    return reportLines.join('\n').trim();
  }
}

export const aiService = new AIService();
