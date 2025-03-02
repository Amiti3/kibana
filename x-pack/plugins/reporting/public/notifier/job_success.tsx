/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FormattedMessage } from '@kbn/i18n-react';
import React, { Fragment } from 'react';
import { ToastInput } from 'src/core/public';
import { toMountPoint } from '../../../../../src/plugins/kibana_react/public';
import { JobId, JobSummary } from '../../common/types';
import { DownloadButton } from './job_download_button';
import { ReportLink } from './report_link';

export const getSuccessToast = (
  job: JobSummary,
  getReportLink: () => string,
  getDownloadLink: (jobId: JobId) => string
): ToastInput => ({
  title: toMountPoint(
    <FormattedMessage
      id="xpack.reporting.publicNotifier.successfullyCreatedReportNotificationTitle"
      defaultMessage="Created report for {reportObjectType} '{reportObjectTitle}'"
      values={{ reportObjectType: job.jobtype, reportObjectTitle: job.title }}
    />
  ),
  color: 'success',
  text: toMountPoint(
    <Fragment>
      <p>
        <ReportLink getUrl={getReportLink} />
      </p>
      <DownloadButton getUrl={getDownloadLink} job={job} />
    </Fragment>
  ),
  'data-test-subj': 'completeReportSuccess',
});
