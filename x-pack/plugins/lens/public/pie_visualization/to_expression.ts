/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Ast } from '@kbn/interpreter';
import type { PaletteRegistry } from 'src/plugins/charts/public';
import type { Operation, DatasourcePublicAPI } from '../types';
import { DEFAULT_PERCENT_DECIMALS, EMPTY_SIZE_RATIOS } from './constants';
import { shouldShowValuesInLegend } from './render_helpers';
import type { PieVisualizationState } from '../../common/expressions';
import { getDefaultVisualValuesForLayer } from '../shared_components/datasource_default_values';

export function toExpression(
  state: PieVisualizationState,
  datasourceLayers: Record<string, DatasourcePublicAPI>,
  paletteService: PaletteRegistry,
  attributes: Partial<{ title: string; description: string }> = {}
) {
  return expressionHelper(state, datasourceLayers, paletteService, {
    ...attributes,
    isPreview: false,
  });
}

function expressionHelper(
  state: PieVisualizationState,
  datasourceLayers: Record<string, DatasourcePublicAPI>,
  paletteService: PaletteRegistry,
  attributes: { isPreview: boolean; title?: string; description?: string } = { isPreview: false }
): Ast | null {
  const layer = state.layers[0];
  const datasource = datasourceLayers[layer.layerId];
  const operations = layer.groups
    .map((columnId) => ({ columnId, operation: datasource.getOperationForColumnId(columnId) }))
    .filter((o): o is { columnId: string; operation: Operation } => !!o.operation);

  if (!layer.metric || !operations.length) {
    return null;
  }

  return {
    type: 'expression',
    chain: [
      {
        type: 'function',
        function: 'lens_pie',
        arguments: {
          title: [attributes.title || ''],
          description: [attributes.description || ''],
          shape: [state.shape],
          hideLabels: [attributes.isPreview],
          groups: operations.map((o) => o.columnId),
          metric: [layer.metric],
          numberDisplay: [layer.numberDisplay],
          categoryDisplay: [layer.categoryDisplay],
          legendDisplay: [layer.legendDisplay],
          legendPosition: [layer.legendPosition || 'right'],
          emptySizeRatio: [layer.emptySizeRatio ?? EMPTY_SIZE_RATIOS.SMALL],
          showValuesInLegend: [shouldShowValuesInLegend(layer, state.shape)],
          percentDecimals: [
            state.shape === 'waffle'
              ? DEFAULT_PERCENT_DECIMALS
              : layer.percentDecimals ?? DEFAULT_PERCENT_DECIMALS,
          ],
          legendMaxLines: [layer.legendMaxLines ?? 1],
          truncateLegend: [
            layer.truncateLegend ??
              getDefaultVisualValuesForLayer(state, datasourceLayers).truncateText,
          ],
          nestedLegend: [!!layer.nestedLegend],
          ...(state.palette
            ? {
                palette: [
                  {
                    type: 'expression',
                    chain: [
                      {
                        type: 'function',
                        function: 'theme',
                        arguments: {
                          variable: ['palette'],
                          default: [
                            paletteService
                              .get(state.palette.name)
                              .toExpression(state.palette.params),
                          ],
                        },
                      },
                    ],
                  },
                ],
              }
            : {}),
        },
      },
    ],
  };
}

export function toPreviewExpression(
  state: PieVisualizationState,
  datasourceLayers: Record<string, DatasourcePublicAPI>,
  paletteService: PaletteRegistry
) {
  return expressionHelper(state, datasourceLayers, paletteService, { isPreview: true });
}
