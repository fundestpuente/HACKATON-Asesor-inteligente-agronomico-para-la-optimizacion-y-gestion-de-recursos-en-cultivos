#!/usr/bin/env node

// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Importar herramientas
import { getCropInformation, cropInfoTool } from './tools/crop-info.js';
import { troubleshootIssue, troubleshootTool } from './tools/troubleshooting.js';
import { calculateSolutionVolume, calculationsTool } from './tools/calculations.js';
import { getGrowingCalendar, calendarTool } from './tools/calendar.js';
import { explainParameter, parametersTool } from './tools/parameters.js';
import {
  getAINutrientRecommendation,
  analyzePlantHealth,
  aiNutrientTool,
  plantHealthTool,
} from './tools/ml-integrations.js';

// Importar recursos
import { CROPS_DATABASE } from './resources/crops-database.js';
import { TROUBLESHOOTING_DATABASE } from './resources/troubleshooting-guide.js';
import { PARAMETERS } from './resources/parameters-reference.js';

/**
 * Servidor MCP para Agro-Mind
 * Chatbot de soporte para agricultores hidropónicos
 */
class AgroMindServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'agro-mind-support-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers() {
    // Handler:  Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        cropInfoTool,
        troubleshootTool,
        calculationsTool,
        calendarTool,
        parametersTool,
        aiNutrientTool,
        plantHealthTool,
      ],
    }));

    // Handler: Ejecutar herramienta
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const name = (request.params as any).name as string;
      const args = ((request.params as any).arguments ?? {}) as Record<string, any>;

      try {
        let result:  string;

        switch (name) {
          case 'get_crop_information':
            result = await getCropInformation(args.crop_name as string);
            break;

          case 'troubleshoot_issue':
            result = troubleshootIssue(
              args.symptoms as string,
              args.crop_type as string | undefined
            );
            break;

          case 'calculate_solution_volume':
            result = calculateSolutionVolume(
              args.tank_liters as number,
              args.target_ec as number | undefined,
              args.calculation_type as string | undefined
            );
            break;

          case 'get_growing_calendar': 
            result = getGrowingCalendar(
              args.crop_name as string,
              args.start_date as string | undefined,
              args.quantity as number | undefined
            );
            break;

          case 'explain_parameter':
            result = explainParameter(
              args.parameter as string,
              args.context as string | undefined
            );
            break;

          case 'get_ai_nutrient_recommendation': 
            result = getAINutrientRecommendation(args as any);
            break;

          case 'analyze_plant_health': 
            result = analyzePlantHealth(args as any);
            break;

          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }

        return {
          content: [{ type: 'text', text: result }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `❌ Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });

    // Handler: Listar recursos
    this.server. setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'agro://crops/database',
          mimeType: 'application/json',
          name: 'Base de Datos de Cultivos',
          description: 'Información completa de cultivos hidropónicos',
        },
        {
          uri: 'agro://guides/troubleshooting',
          mimeType: 'text/markdown',
          name: 'Guía de Troubleshooting',
          description:  'Soluciones a problemas comunes',
        },
        {
          uri: 'agro://reference/parameters',
          mimeType: 'text/markdown',
          name: 'Referencia de Parámetros',
          description: 'Explicación de parámetros técnicos',
        },
      ],
    }));

    // Handler: Leer recurso
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'agro://crops/database':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(CROPS_DATABASE, null, 2),
              },
            ],
          };

        case 'agro://guides/troubleshooting': 
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: JSON.stringify(TROUBLESHOOTING_DATABASE, null, 2),
              },
            ],
          };

        case 'agro://reference/parameters':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: JSON.stringify(PARAMETERS, null, 2),
              },
            ],
          };

        default:
          throw new Error(`Recurso no encontrado: ${uri}`);
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🌱 Agro-Mind MCP Server iniciado');
  }
}

// Iniciar servidor
const server = new AgroMindServer();
server.run().catch(console.error);