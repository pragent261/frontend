import { Button, Modal, Steps, Input, Upload, Table, Select, message } from "antd";
import { CloseOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { BookOpen, Table as TableIcon, Image as ImageIcon, HelpCircle, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useState, useCallback } from "react";
import type { UploadFile } from "antd/es/upload/interface";
import * as XLSX from "xlsx";
import { apiFetch } from "../lib/api";
import "../styles.css";

const { Dragger } = Upload;

// 合作模式选项
const collaborationModes: { value: string; label: string; icon: ReactNode; description: string }[] = [
    {
        value: "send_sample",
        label: "送拍",
        icon: <BookOpen />,
        description: "品牌方给博主寄产品，发布笔记后结算，产品给博主"
    },
    {
        value: "return_sample",
        label: "寄拍",
        icon: <TableIcon />,
        description: "品牌方给博主寄产品，发布笔记后结算，产品还给品牌方（邮费一般由品牌方承担）"
    },
    {
        value: "exchange",
        label: "置换",
        icon: <ImageIcon />,
        description: "无费，品牌方送产品，博主发笔记"
    }
];

const pugongyingModes: { value: string; label: string; icon: ReactNode; description: string }[] = [
    {
        value: "pugongying_reported",
        label: "蒲公英报备",
        icon: <BookOpen />,
        description: "品牌方给博主寄产品，发布笔记后结算，产品给博主"
    },
    {
        value: "underwater",
        label: "水下/非报备",
        icon: <TableIcon />,
        description: "品牌方给博主寄产品，发布笔记后结算，产品还给品牌方（邮费一般由品牌方承担）"
    }
];

// 数据来源选项
const dataSourceOptions = [
    {
        value: "upload",
        label: "上传数据表",
        description: "直接上传文件并解析，支持多种文件格式，上传后的原始文件将存储在应用数据"
    },
    {
        value: "select",
        label: "选择数据表",
        description: "选择数据中心的数据表"
    },
    {
        value: "connect",
        label: "关联数据库",
        description: "关联 RDS 等云上数据库"
    }
];

type StepKey = "basic" | "influencers" | "content";

interface FormData {
    name: string;
    collaborationMode: string;
    brandSiteUrl: string;
    taobaoUrl: string;
    sampleFiles: UploadFile[];
    // 博主列表
    dataSource: string;
    dataTableName: string;
    influencerFiles: UploadFile[];
    influencerColumns: { name: string; type: string }[];
    // 内容
    contentDataSource: string;
    contentBriefFiles: UploadFile[];
    contentColumns: { name: string; type: string }[];
}

const initialFormData: FormData = {
    name: "",
    collaborationMode: "send_sample",
    brandSiteUrl: "",
    taobaoUrl: "",
    sampleFiles: [],
    dataSource: "upload",
    dataTableName: "",
    influencerFiles: [],
    influencerColumns: [],
    contentDataSource: "upload",
    contentBriefFiles: [],
    contentColumns: []
};

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateCampaignModal({ open, onClose, onSuccess }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const steps: { key: StepKey; title: string }[] = [
        { key: "basic", title: "基本信息" },
        { key: "influencers", title: "博主列表" },
        { key: "content", title: "内容" }
    ];

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setCurrentStep(0);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    const updateFormData = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSaveDraft = async () => {
        if (!formData.name.trim()) {
            message.warning("请输入投放计划名称");
            return;
        }

        setSaving(true);
        try {
            const response = await apiFetch("/v1/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    collaboration_mode: formData.collaborationMode,
                    brand_site_url: formData.brandSiteUrl || null,
                    taobao_url: formData.taobaoUrl || null,
                    status: "draft",
                    config: {
                        dataSource: formData.dataSource,
                        dataTableName: formData.dataTableName
                    }
                })
            });

            if (!response.ok) throw new Error("保存失败");

            message.success("草稿保存成功");
            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error("Save draft error:", error);
            message.error("保存失败，请稍后重试");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!formData.name.trim()) {
            message.warning("请输入投放计划名称");
            return;
        }

        setPublishing(true);
        try {
            // 先保存
            const createResponse = await apiFetch("/v1/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    collaboration_mode: formData.collaborationMode,
                    brand_site_url: formData.brandSiteUrl || null,
                    taobao_url: formData.taobaoUrl || null,
                    status: "draft",
                    config: {
                        dataSource: formData.dataSource,
                        dataTableName: formData.dataTableName
                    }
                })
            });

            if (!createResponse.ok) throw new Error("创建失败");

            const campaign = await createResponse.json();

            // 再发布
            const publishResponse = await apiFetch(`/v1/campaigns/${campaign.id}/publish`, {
                method: "POST"
            });

            if (!publishResponse.ok) throw new Error("发布失败");

            message.success("投放计划已发布");
            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error("Publish error:", error);
            message.error("发布失败，请稍后重试");
        } finally {
            setPublishing(false);
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };


    // 解析上传的 Excel 文件预览列
    const parseExcelFile = useCallback(async (file: File, target: "influencers" | "content") => {
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // 获取表头 (第一行)
            const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
            const headers: { name: string; type: string }[] = [];

            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                const cell = worksheet[cellAddress];
                if (cell && cell.v) {
                    headers.push({ name: String(cell.v), type: "" });
                }
            }

            if (headers.length === 0) {
                message.warning("未能解析到表头，请确保文件格式正确");
                return;
            }

            if (target === "influencers") {
                updateFormData("influencerColumns", headers);
            } else {
                updateFormData("contentColumns", headers);
            }

            message.success(`成功解析 ${headers.length} 个列`);
        } catch (error) {
            console.error("Excel parsing error:", error);
            message.error("文件解析失败，请确保文件格式正确");
        }
    }, [updateFormData]);

    const renderBasicInfo = () => (
        <div className="create-campaign__section">
            <div className="create-campaign__field">
                <label className="create-campaign__label">
                    投放计划名称 <span className="create-campaign__required">*</span>
                </label>
                <Input
                    placeholder="请输入投放计划名称"
                    maxLength={20}
                    value={formData.name}
                    onChange={e => updateFormData("name", e.target.value)}
                    suffix={<span className="create-campaign__counter">{formData.name.length}/20</span>}
                />
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">预期合作模式</label>
                <div className="create-campaign__modes">
                    {collaborationModes.map(mode => (
                        <div
                            key={mode.value}
                            className={`create-campaign__mode-card${formData.collaborationMode === mode.value
                                ? " create-campaign__mode-card--selected"
                                : ""
                                }`}
                            onClick={() => updateFormData("collaborationMode", mode.value)}
                        >
                            <span className="create-campaign__mode-radio" aria-hidden />
                            <div className="create-campaign__mode-icon">{mode.icon}</div>
                            <div className="create-campaign__mode-label">{mode.label}</div>
                            <div className="create-campaign__mode-desc">{mode.description}</div>
                        </div>
                    ))}
                </div>

                <div className="create-campaign__modes-section">
                    <div className="create-campaign__modes-title">蒲公英</div>
                    <div className="create-campaign__modes">
                        {pugongyingModes.map(mode => (
                            <div
                                key={mode.value}
                                className={`create-campaign__mode-card${formData.collaborationMode === mode.value
                                    ? " create-campaign__mode-card--selected"
                                    : ""
                                    }`}
                                onClick={() => updateFormData("collaborationMode", mode.value)}
                            >
                                <span className="create-campaign__mode-radio" aria-hidden />
                                <div className="create-campaign__mode-icon">{mode.icon}</div>
                                <div className="create-campaign__mode-label">{mode.label}</div>
                                <div className="create-campaign__mode-desc">{mode.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">品牌方网站</label>
                <Input
                    placeholder="请输入品牌方网站"
                    value={formData.brandSiteUrl}
                    onChange={e => updateFormData("brandSiteUrl", e.target.value)}
                />
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">淘宝店铺链接</label>
                <Input
                    placeholder="请输入淘宝店铺链接"
                    value={formData.taobaoUrl}
                    onChange={e => updateFormData("taobaoUrl", e.target.value)}
                />
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">合作样品</label>
                <Dragger
                    multiple
                    fileList={formData.sampleFiles}
                    onChange={info => updateFormData("sampleFiles", info.fileList)}
                    beforeUpload={() => false}
                    className="create-campaign__upload"
                >
                    <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽上传文件</p>
                    <p className="ant-upload-hint">上传一份 .xlsx, .xls 格式的文档，文件大小限制 20MB 以内。</p>
                </Dragger>
            </div>
        </div>
    );

    const renderInfluencerList = () => (
        <div className="create-campaign__section">
            <div className="create-campaign__field">
                <label className="create-campaign__label create-campaign__label--highlight">数据来源</label>
                <p className="create-campaign__hint">
                    从数据中心选择已经解析的文档文件构建知识索引，或直接上传文件解析并构建索引。上传的文件将自动存储在数据中心。
                </p>
                <div className="create-campaign__source-options">
                    {dataSourceOptions.map(option => (
                        <div
                            key={option.value}
                            className={`create-campaign__source-card${formData.dataSource === option.value
                                ? " create-campaign__source-card--selected"
                                : ""
                                }`}
                            onClick={() => updateFormData("dataSource", option.value)}
                        >
                            <span className="create-campaign__source-radio" aria-hidden />
                            <div className="create-campaign__source-label">{option.label}</div>
                            <div className="create-campaign__source-desc">{option.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">数据表名称</label>
                <Input
                    placeholder=""
                    maxLength={64}
                    value={formData.dataTableName}
                    onChange={e => updateFormData("dataTableName", e.target.value)}
                    suffix={<span className="create-campaign__counter">{formData.dataTableName.length}/64</span>}
                />
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">上传数据表</label>
                <span className="create-campaign__link">默认通过第一行数据识别表结构查看详情</span>
                <Dragger
                    accept=".xlsx,.xls"
                    multiple={false}
                    fileList={formData.influencerFiles}
                    onChange={info => {
                        updateFormData("influencerFiles", info.fileList);
                        if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
                            parseExcelFile(info.fileList[0].originFileObj, "influencers");
                        } else {
                            updateFormData("influencerColumns", []);
                        }
                    }}
                    beforeUpload={() => false}
                    className="create-campaign__upload"
                >
                    <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽上传文件</p>
                    <p className="ant-upload-hint">上传一份 .xlsx, .xls 格式的文档，文件大小限制 20MB 以内。</p>
                </Dragger>
            </div>

            {formData.influencerFiles.length > 0 && (
                <>
                    <div className="create-campaign__file-info">
                        <div className="create-campaign__file-icon">📊</div>
                        <div className="create-campaign__file-details">
                            <div className="create-campaign__file-name">{formData.influencerFiles[0]?.name}</div>
                            <div className="create-campaign__file-size">
                                {((formData.influencerFiles[0]?.size || 0) / 1024).toFixed(2)} KB
                            </div>
                        </div>
                        <div className="create-campaign__file-actions">
                            <span className="create-campaign__file-preview">预览</span>
                            <span
                                className="create-campaign__file-delete"
                                onClick={() => {
                                    updateFormData("influencerFiles", []);
                                    updateFormData("influencerColumns", []);
                                }}
                            >🗑️</span>
                        </div>
                    </div>

                    <div className="create-campaign__field">
                        <label className="create-campaign__label">表结构预览</label>
                        <Table
                            dataSource={formData.influencerColumns.map((col, idx) => ({ key: idx, ...col }))}
                            columns={[
                                { title: "列名", dataIndex: "name", key: "name" },
                                {
                                    title: "类型",
                                    dataIndex: "type",
                                    key: "type",
                                    render: (_, record, index) => (
                                        <Select
                                            style={{ width: 200 }}
                                            placeholder="选择类型"
                                            value={record.type || undefined}
                                            onChange={value => {
                                                const newColumns = [...formData.influencerColumns];
                                                newColumns[index] = { ...newColumns[index], type: value };
                                                updateFormData("influencerColumns", newColumns);
                                            }}
                                            options={[
                                                { value: "string", label: "文本" },
                                                { value: "number", label: "数字" },
                                                { value: "date", label: "日期" },
                                                { value: "platform", label: "平台" },
                                                { value: "url", label: "链接" }
                                            ]}
                                        />
                                    )
                                }
                            ]}
                            pagination={{ pageSize: 6, size: "small" }}
                            size="small"
                        />
                    </div>
                </>
            )}
        </div>
    );

    const renderContent = () => (
        <div className="create-campaign__section">
            <div className="create-campaign__field">
                <label className="create-campaign__label create-campaign__label--highlight">数据来源</label>
                <p className="create-campaign__hint">
                    从数据中心选择已经解析的文档文件构建知识索引，或直接上传文件解析并构建索引。上传的文件将自动存储在数据中心。
                </p>
                <div className="create-campaign__source-options">
                    {dataSourceOptions.map(option => (
                        <div
                            key={option.value}
                            className={`create-campaign__source-card${formData.contentDataSource === option.value
                                ? " create-campaign__source-card--selected"
                                : ""
                                }`}
                            onClick={() => updateFormData("contentDataSource", option.value)}
                        >
                            <span className="create-campaign__source-radio" aria-hidden />
                            <div className="create-campaign__source-label">{option.label}</div>
                            <div className="create-campaign__source-desc">{option.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">数据表名称</label>
                <Input
                    placeholder=""
                    maxLength={64}
                    value={formData.dataTableName}
                    onChange={e => updateFormData("dataTableName", e.target.value)}
                    suffix={<span className="create-campaign__counter">{formData.dataTableName.length}/64</span>}
                />
            </div>

            <div className="create-campaign__field">
                <label className="create-campaign__label">
                    内容Brief <span className="create-campaign__required">*</span>
                </label>
                <Dragger
                    accept=".xlsx,.xls"
                    multiple={false}
                    fileList={formData.contentBriefFiles}
                    onChange={info => {
                        updateFormData("contentBriefFiles", info.fileList);
                        if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
                            parseExcelFile(info.fileList[0].originFileObj, "content");
                        } else {
                            updateFormData("contentColumns", []);
                        }
                    }}
                    beforeUpload={() => false}
                    className="create-campaign__upload"
                >
                    <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽上传文件</p>
                    <p className="ant-upload-hint">上传一份 .xlsx, .xls 格式的文档，文件大小限制 20MB 以内。</p>
                </Dragger>
            </div>

            {formData.contentBriefFiles.length > 0 && (
                <>
                    <div className="create-campaign__file-info">
                        <div className="create-campaign__file-icon">📊</div>
                        <div className="create-campaign__file-details">
                            <div className="create-campaign__file-name">{formData.contentBriefFiles[0]?.name}</div>
                            <div className="create-campaign__file-size">
                                {((formData.contentBriefFiles[0]?.size || 0) / 1024).toFixed(2)} KB
                            </div>
                        </div>
                        <div className="create-campaign__file-actions">
                            <span className="create-campaign__file-preview">预览</span>
                            <span
                                className="create-campaign__file-delete"
                                onClick={() => {
                                    updateFormData("contentBriefFiles", []);
                                    updateFormData("contentColumns", []);
                                }}
                            >🗑️</span>
                        </div>
                    </div>

                    <div className="create-campaign__field">
                        <label className="create-campaign__label">表结构预览</label>
                        <Table
                            dataSource={formData.contentColumns.map((col, idx) => ({ key: idx, ...col }))}
                            columns={[
                                { title: "列名", dataIndex: "name", key: "name" },
                                {
                                    title: "类型",
                                    dataIndex: "type",
                                    key: "type",
                                    render: (_, record, index) => (
                                        <Select
                                            style={{ width: 200 }}
                                            placeholder="选择类型"
                                            value={record.type || undefined}
                                            onChange={value => {
                                                const newColumns = [...formData.contentColumns];
                                                newColumns[index] = { ...newColumns[index], type: value };
                                                updateFormData("contentColumns", newColumns);
                                            }}
                                            options={[
                                                { value: "string", label: "文本" },
                                                { value: "number", label: "数字" },
                                                { value: "date", label: "日期" },
                                                { value: "platform", label: "平台" },
                                                { value: "url", label: "链接" }
                                            ]}
                                        />
                                    )
                                }
                            ]}
                            pagination={{ pageSize: 6, size: "small" }}
                            size="small"
                        />
                    </div>
                </>
            )}
        </div>
    );

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            width="100vw"
            style={{ top: 0, maxWidth: "100vw", paddingBottom: 0, margin: 0 }}
            footer={null}
            closable={false}
            className="create-campaign-modal"
            destroyOnClose
        >
            <div className="create-campaign">
                <div className="create-campaign__header">
                    <button className="create-campaign__close" onClick={handleClose}>
                        <CloseOutlined />
                    </button>
                    <div className="create-campaign__title">新投放计划</div>
                    <div className="create-campaign__actions">
                        <span className="create-campaign__help">
                            <HelpCircle />
                            发布之后会发生什么?
                        </span>
                        <Button onClick={handleSaveDraft} loading={saving}>
                            保存草稿
                        </Button>
                        <Button
                            type="primary"
                            onClick={currentStep === steps.length - 1 ? handlePublish : handleNext}
                            loading={publishing}
                        >
                            {currentStep === steps.length - 1 ? "发布" : "下一个"}
                        </Button>
                    </div>
                </div>

                <div className="create-campaign__body">
                    <div className="create-campaign__sidebar">
                        <Steps
                            direction="vertical"
                            current={currentStep}
                            onChange={setCurrentStep}
                            items={steps.map((step, index) => ({
                                title: step.title,
                                status: index < currentStep ? "finish" : index === currentStep ? "process" : "wait"
                            }))}
                        />
                    </div>

                    <div className="create-campaign__content">
                        {currentStep === 0 && renderBasicInfo()}
                        {currentStep === 1 && renderInfluencerList()}
                        {currentStep === 2 && renderContent()}
                    </div>
                </div>

                <div className="create-campaign__footer">
                    <span className="create-campaign__collapse">
                        <ChevronLeft />
                        收起
                    </span>
                </div>
            </div>
        </Modal>
    );
}
