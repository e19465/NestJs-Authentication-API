import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly maxRetries = 5;
  private readonly retryDelayMs = 5000;

  async onModuleInit() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.$connect();
        console.log('✅ Database connection established successfully');
        return;
      } catch (error) {
        console.error(
          `❌ Attempt ${attempt} failed to connect to the database.`,
        );

        if (attempt < this.maxRetries) {
          console.log(`⏳ Retrying in ${this.retryDelayMs / 1000} seconds...`);
          await this.delay(this.retryDelayMs);
        } else {
          console.log('Occured Error: ', error);
          console.error('🚨 All retry attempts failed. Exiting...');
          process.exit(1); // Exit the process after all retries fail
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
