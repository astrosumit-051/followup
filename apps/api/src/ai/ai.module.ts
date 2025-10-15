import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

/**
 * AI Module
 *
 * Provides AI-powered features using LangChain integration with multiple LLM providers.
 * Supports OpenAI GPT-4 Turbo (primary) and Anthropic Claude Sonnet 3.5 (fallback).
 *
 * Features:
 * - Email template generation with formal and casual styles
 * - Multi-provider fallback chain for reliability
 * - Contact context integration for personalization
 * - Token usage tracking for cost monitoring
 * - Conversation history integration
 *
 * Environment Variables Required:
 * - OPENAI_API_KEY: OpenAI API key for GPT-4 Turbo access
 * - ANTHROPIC_API_KEY: Anthropic API key for Claude access
 */
@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
