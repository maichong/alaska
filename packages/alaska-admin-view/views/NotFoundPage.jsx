//@flow

import React from 'react';
import PropTypes from 'prop-types';

export default class NotFoundPage extends React.Component<{}> {
  static contextTypes = {
    t: PropTypes.func
  };

  render() {
    const { t } = this.context;
    return (
      <div className="error-page">
        <div className="error-info">
          <div className="error-info-title">{t('Not Found!')}</div>
          <div className="error-info-desc">
            {t('Requested page not found.')}
          </div>
        </div>
      </div>
    );
  }
}
