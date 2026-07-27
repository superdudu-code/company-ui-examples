<template>
  <NModal
    v-model:show="show"
    class="custom-style-dialog base-dialog-form"
    preset="dialog"
    :title="title"
    :show-icon="false"
    :closable="!loading"
    :close-on-esc="!loading"
    :mask-closable="!loading"
    @after-leave="resetForm"
  >
    <NForm
      ref="formRef"
      class="base-dialog-form__body"
      :model="form"
      :rules="rules"
      label-placement="left"
      label-align="left"
      label-width="72px"
      size="small"
    >
      <NFormItem label="商品名" path="name">
        <NInput v-model:value="form.name" clearable maxlength="80" placeholder="请输入商品名" />
      </NFormItem>
      <NFormItem label="品牌" path="brand">
        <PcBrandSelect
          v-model:value="form.brand"
          clearable
          value-field="goodsBrandName"
          placeholder="请选择品牌"
        />
      </NFormItem>
      <NFormItem label="价格" path="price">
        <NInputNumber
          v-model:value="form.price"
          class="base-dialog-form__price"
          :min="0"
          :precision="2"
          :show-button="false"
          placeholder="请输入商品价格"
        >
          <template #prefix>¥</template>
        </NInputNumber>
      </NFormItem>
    </NForm>

    <template #action>
      <NButton size="small" :disabled="loading" @click="close">取消</NButton>
      <NButton size="small" type="primary" :loading="loading" @click="handleSubmit">确定</NButton>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { PcBrandSelect } from '@puture-ui/business'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  createDiscreteApi,
  type FormInst,
  type FormRules
} from 'naive-ui'
import { saveProduct, type ProductFormPayload } from '@/api/list/api'
import type { ProductItem } from '@/api/list/mock'

type DialogMode = 'create' | 'edit'

type ProductDialogForm = {
  id: number | null
  name: string
  brand: string | null
  price: number | null
}

const emit = defineEmits<{
  (event: 'success'): void
}>()

const { message } = createDiscreteApi(['message'])
const show = ref(false)
const loading = ref(false)
const mode = ref<DialogMode>('create')
const formRef = ref<FormInst | null>(null)
const form = ref<ProductDialogForm>(createDefaultForm())
const title = computed(() => (mode.value === 'create' ? '新增商品' : '编辑商品'))

const rules: FormRules = {
  name: [
    { required: true, message: '请输入商品名', trigger: ['input', 'blur'] },
    { max: 80, message: '商品名不能超过 80 个字符', trigger: ['input', 'blur'] }
  ],
  brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  price: [
    { required: true, type: 'number', message: '请输入商品价格', trigger: ['input', 'blur'] },
    {
      validator: (_rule, value) => typeof value === 'number' && value >= 0,
      message: '商品价格不能小于 0',
      trigger: ['input', 'blur']
    }
  ]
}

/** 创建弹窗表单的默认数据。 */
function createDefaultForm(): ProductDialogForm {
  return {
    id: null,
    name: '',
    brand: null,
    price: null
  }
}

/** 打开新增或编辑弹窗，并初始化本次操作的数据。 */
function open(nextMode: DialogMode, row?: ProductItem) {
  mode.value = nextMode
  initData(row)
  show.value = true

  void nextTick(() => {
    formRef.value?.restoreValidation()
  })
}

/** 初始化数据 */
function initData(row?: ProductItem) {
  form.value = row
    ? {
        id: row.id,
        name: row.name,
        brand: row.brand,
        price: row.price
      }
    : createDefaultForm()
}

/** 关闭弹窗，表单数据在离场动画结束后重置。 */
function close() {
  show.value = false
}

/** 重置表单数据与校验状态。 */
function resetForm() {
  form.value = createDefaultForm()
  formRef.value?.restoreValidation()
}

/** 校验并保存商品，成功后通知父页面刷新数据。 */
async function handleSubmit() {
  if (loading.value) return

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (!form.value.brand || form.value.price === null) return

  const data: ProductFormPayload = {
    name: form.value.name.trim(),
    brand: form.value.brand,
    price: form.value.price
  }
  if (mode.value === 'edit' && form.value.id !== null) {
    data.id = form.value.id
  }

  try {
    loading.value = true
    await saveProduct(data)
    message.success(mode.value === 'create' ? '新增成功' : '编辑成功')
    close()
    emit('success')
  } finally {
    loading.value = false
  }
}

defineExpose({
  open
})
</script>

<style scoped lang="scss">
:global(.base-dialog-form.n-dialog) {
  width: min(520px, calc(100vw - 32px));
  border-radius: var(--pc-radius-base);
}

.base-dialog-form__body {
  padding-top: 8px;
}

.base-dialog-form__price {
  width: 100%;

  :deep(.n-input__input-el) {
    font-variant-numeric: tabular-nums;
  }
}
</style>
