/*
 * CreateAccountPage
 *
 */

import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Form, Icon, Input } from 'antd';
import copy from 'copy-to-clipboard';
import {
  formItemLayout,
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

export class CreateAccountPage extends React.Component {
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
    const {
      jsonInfo,
      keyProvider,
      AccountName,
      NewAccountName,
      ActiveKey,
      OwnerKey,
      Bytes,
      StakeNetQuantity,
      StakeCpuQuantity,
      transaction,
    } = values;
    this.setState({
      GetTransactionButtonState:
        jsonInfo &&
        keyProvider &&
        AccountName &&
        NewAccountName &&
        ActiveKey &&
        OwnerKey &&
        Bytes &&
        StakeNetQuantity &&
        StakeCpuQuantity,
    });
    this.setState({
      CopyTransactionButtonState:
        jsonInfo &&
        keyProvider &&
        AccountName &&
        NewAccountName &&
        ActiveKey &&
        OwnerKey &&
        Bytes &&
        StakeNetQuantity &&
        StakeCpuQuantity &&
        transaction,
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
    const {
      AccountName,
      NewAccountName,
      ActiveKey,
      OwnerKey,
      Bytes,
      StakeNetQuantity,
      StakeCpuQuantity,
    } = values;
    const actions = [];
    const NewAccountAction = {
      account: 'eosio',
      name: 'newaccount',
      authorization: [
        {
          actor: AccountName,
          permission: 'active',
        },
      ],
      data: {
        creator: AccountName,
        name: NewAccountName,
        owner: OwnerKey,
        active: ActiveKey,
      },
    };
    actions.push(NewAccountAction);
    const BuyRamBytesAction = {
      account: 'eosio',
      name: 'buyrambytes',
      authorization: [
        {
          actor: AccountName,
          permission: 'active',
        },
      ],
      data: {
        payer: AccountName,
        receiver: NewAccountName,
        bytes: Number(Bytes),
      },
    };
    actions.push(BuyRamBytesAction);
    const DelegateBwAction = {
      account: 'eosio',
      name: 'delegatebw',
      authorization: [
        {
          actor: AccountName,
          permission: 'active',
        },
      ],
      data: {
        from: AccountName,
        receiver: NewAccountName,
        stake_net_quantity: `${Number(StakeNetQuantity)
          .toFixed(4)
          .toString()} EOS`,
        stake_cpu_quantity: `${Number(StakeCpuQuantity)
          .toFixed(4)
          .toString()} EOS`,
        transfer: 0,
      },
    };
    actions.push(DelegateBwAction);
    eos
      .transaction({
        actions,
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
    const CreatorAccountNamePlaceholder = this.state.formatMessage(
      messages.CreatorAccountNamePlaceholder,
    );
    const NewAccountNamePlaceholder = this.state.formatMessage(
      messages.NewAccountNamePlaceholder,
    );
    const NewAccountNameHelp = this.state.formatMessage(
      messages.NewAccountNameHelp,
    );
    const OwnerKeyPlaceholder = this.state.formatMessage(
      messages.OwnerKeyPlaceholder,
    );
    const ActiveKeyPlaceholder = this.state.formatMessage(
      messages.ActiveKeyPlaceholder,
    );
    const BytesHelp = this.state.formatMessage(messages.BytesHelp);
    const BytesPlaceholder = this.state.formatMessage(
      messages.BytesPlaceholder,
    );
    const StakeNetQuantityPlaceholder = this.state.formatMessage(
      messages.StakeNetQuantityPlaceholder,
    );
    const StakeCpuQuantityPlaceholder = this.state.formatMessage(
      messages.StakeCpuQuantityPlaceholder,
    );
    const CreatorLabel = this.state.formatMessage(messages.CreatorLabel);
    const NameLabel = this.state.formatMessage(messages.NameLabel);
    const BytesLabel = this.state.formatMessage(messages.BytesLabel);
    return (
      <LayoutContent>
        <LayoutContentBox>
          <FormComp>
            <ScanQrcode
              form={this.props.form}
              formatMessage={this.state.formatMessage}
            />
            <FormItem {...formItemLayout} label={CreatorLabel} colon>
              {getFieldDecorator('AccountName', {
                rules: [
                  { required: true, message: CreatorAccountNamePlaceholder },
                ],
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder={CreatorAccountNamePlaceholder}
                />,
              )}
            </FormItem>
            <FormItem
              help={NewAccountNameHelp}
              {...formItemLayout}
              label={NameLabel}
              colon
            >
              {getFieldDecorator('NewAccountName', {
                rules: [
                  {
                    required: true,
                    len: 12,
                    message: NewAccountNamePlaceholder,
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder={NewAccountNamePlaceholder}
                />,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="OwnerKey" colon>
              {getFieldDecorator('OwnerKey', {
                rules: [
                  {
                    required: false,
                    message: OwnerKeyPlaceholder,
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon type="unlock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder={OwnerKeyPlaceholder}
                />,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="ActiveKey" colon>
              {getFieldDecorator('ActiveKey', {
                rules: [
                  {
                    required: true,
                    message: ActiveKeyPlaceholder,
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon type="unlock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder={ActiveKeyPlaceholder}
                />,
              )}
            </FormItem>
            <FormItem
              help={BytesHelp}
              {...formItemLayout}
              label={BytesLabel}
              colon
            >
              {getFieldDecorator('Bytes', {
                rules: [
                  {
                    required: true,
                    message: BytesPlaceholder,
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon
                      type="pay-circle-o"
                      style={{ color: 'rgba(0,0,0,.25)' }}
                    />
                  }
                  placeholder={BytesPlaceholder}
                />,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="StakeNet" colon>
              {getFieldDecorator('StakeNetQuantity', {
                rules: [
                  {
                    required: true,
                    message: StakeNetQuantityPlaceholder,
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon
                      type="pay-circle-o"
                      style={{ color: 'rgba(0,0,0,.25)' }}
                    />
                  }
                  placeholder={StakeNetQuantityPlaceholder}
                />,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="StakeCpu" colon>
              {getFieldDecorator('StakeCpuQuantity', {
                rules: [
                  {
                    required: true,
                    message: StakeCpuQuantityPlaceholder,
                  },
                ],
              })(
                <Input
                  prefix={
                    <Icon
                      type="pay-circle-o"
                      style={{ color: 'rgba(0,0,0,.25)' }}
                    />
                  }
                  placeholder={StakeCpuQuantityPlaceholder}
                />,
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

CreateAccountPage.propTypes = {
  form: PropTypes.object,
  intl: PropTypes.object,
};
const CreateAccountPageIntl = injectIntl(CreateAccountPage);
const CreateAccountPageForm = Form.create()(CreateAccountPageIntl);

export default CreateAccountPageForm;
