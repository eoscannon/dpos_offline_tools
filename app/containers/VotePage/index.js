/*
 * VotePage
 *
 */

import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Form, Icon, Input, Select } from 'antd';
import copy from 'copy-to-clipboard';
import {
  formItemLayout,
  voteNodes,
  getEos,
  openTransactionFailNotification,
  openTransactionSuccessNotification,
  openNotification,
} from '../../utils/utils';
import {
  LayoutContentBox,
  LayoutContent,
  FormComp,
} from '../../components/NodeComp';
import ScanQrcode from '../../components/ScanQrcode';
import GetQrcode from '../../components/GetQrcode';
import messages from './messages';
import utilsMsg from '../../utils/messages';

const FormItem = Form.Item;
const { Option } = Select;

export class VotePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formatMessage: this.props.intl.formatMessage,
      GetTransactionButtonLoading: false, // 点击获取报文时，按钮加载状态
      GetTransactionButtonState: false, // 获取报文按钮可点击状态
      CopyTransactionButtonState: false, // 复制报文按钮可点击状态
      QrCodeValue: this.props.intl.formatMessage(utilsMsg.QrCodeInitValue), // 二维码内容
    };
  }
  /**
   * 输入框内容变化时，改变按钮状态
   * */
  componentWillReceiveProps(nextProps) {
    this.onValuesChange(nextProps);
  }
  /**
   * 输入框内容变化时，改变按钮状态
   * */
  onValuesChange = nextProps => {
    const values = nextProps.form.getFieldsValue();
    const { jsonInfo, keyProvider, voter, producers, transaction } = values;
    this.setState({
      GetTransactionButtonState: jsonInfo && keyProvider && voter && producers,
    });
    this.setState({
      CopyTransactionButtonState:
        jsonInfo && keyProvider && voter && producers && transaction,
    });
  };
  /**
   * 用户点击生成报文，根据用户输入参数，生成签名报文，并将其赋值到文本框和生成对应的二维码
   * */
  handleGetTransaction = () => {
    if (!this.state.GetTransactionButtonState) {
      return;
    }
    this.setState({
      GetTransactionButtonLoading: true,
    });
    const values = this.props.form.getFieldsValue();
    const eos = getEos(values);
    const { voter, producers } = values;
    producers.sort();
    eos
      .voteproducer({
        voter,
        proxy: '',
        producers,
      })
      .then(tr => {
        this.props.form.setFieldsValue({
          transaction: JSON.stringify(tr.transaction),
        });
        this.setState({
          GetTransactionButtonLoading: false,
          QrCodeValue: JSON.stringify(tr.transaction),
        });
        openTransactionSuccessNotification(this.state.formatMessage);
      })
      .catch(err => {
        this.setState({
          GetTransactionButtonLoading: false,
        });
        openTransactionFailNotification(this.state.formatMessage, err.name);
      });
  };
  /**
   * 用户点击复制签名报文，将报文赋值到剪贴板，并提示用户已复制成功
   * */
  handleCopyTransaction = () => {
    if (!this.state.CopyTransactionButtonState) {
      return;
    }
    const values = this.props.form.getFieldsValue();
    const { transaction } = values;
    copy(transaction);
    openNotification(this.state.formatMessage);
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const VotePageVoterPlaceholder = this.state.formatMessage(
      messages.VotePageVoterPlaceholder,
    );
    const VotePageProducersHelp = this.state.formatMessage(
      messages.VotePageProducersHelp,
    );
    const VotePageProducersPlaceholder = this.state.formatMessage(
      messages.VotePageProducersPlaceholder,
    );
    const VoterLabel = this.state.formatMessage(messages.VoterLabel);
    const ProducersLabel = this.state.formatMessage(messages.ProducersLabel);
    return (
      <LayoutContent>
        <LayoutContentBox>
          <FormComp>
            <ScanQrcode
              form={this.props.form}
              formatMessage={this.state.formatMessage}
            />
            <FormItem {...formItemLayout} label={VoterLabel} colon>
              {getFieldDecorator('voter', {
                rules: [{ required: true, message: VotePageVoterPlaceholder }],
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder={VotePageVoterPlaceholder}
                />,
              )}
            </FormItem>
            <FormItem
              help={VotePageProducersHelp}
              {...formItemLayout}
              label={ProducersLabel}
              colon
            >
              {getFieldDecorator('producers', {
                rules: [
                  {
                    required: true,
                    message: VotePageProducersPlaceholder,
                  },
                ],
              })(
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder={VotePageProducersPlaceholder}
                >
                  {voteNodes.map(item => <Option key={item}>{item}</Option>)}
                </Select>,
              )}
            </FormItem>
            <GetQrcode
              form={this.props.form}
              formatMessage={this.state.formatMessage}
              GetTransactionButtonClick={this.handleGetTransaction}
              GetTransactionButtonLoading={
                this.state.GetTransactionButtonLoading
              }
              GetTransactionButtonDisabled={
                this.state.GetTransactionButtonState
              }
              QrCodeValue={this.state.QrCodeValue}
              CopyTransactionButtonState={this.state.CopyTransactionButtonState}
              handleCopyTransaction={this.handleCopyTransaction}
            />
          </FormComp>
        </LayoutContentBox>
      </LayoutContent>
    );
  }
}

VotePage.propTypes = {
  form: PropTypes.object,
  intl: PropTypes.object,
};

const VotePageIntl = injectIntl(VotePage);
const VotePageForm = Form.create()(VotePageIntl);

export default VotePageForm;
