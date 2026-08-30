<script setup lang="ts">
import { z } from 'zod'
import { useWizardStore } from '~/stores/wizard'

definePageMeta({
  layout: 'onboarding',
})

const router = useRouter()
const { t } = useI18n()
const wizardStore = useWizardStore()

// Mark this step as accessible when entering the page
wizardStore.markStepAccessible(5)

// Use the wizard form composable
const {
  fields,
  state,
  loading: fetchingSchema,
  isFieldVisible,
} = useWizardForm('analytics')

// Dynamic schema based on visible fields
const schema = computed(() => {
  const s: Record<string, any> = {}
  fields.value.forEach((field) => {
    if (!isFieldVisible(field)) return

    let validator: z.ZodTypeAny

    if (field.type === 'boolean' || field.ui.type === 'toggle') {
      validator = z.boolean()
    } else {
      validator = z.string()
      if (field.ui.required) {
        validator = (validator as z.ZodString).min(
          1,
          `${t('common.validation.isRequired', { field: t(field.label || '') })}`,
        )
      } else {
        validator = (validator as z.ZodString).optional()
      }
    }

    s[field.key] = validator
  })
  return z.object(s)
})

function onSubmit() {
  // Validation passed, data is already in the store via useWizardForm binding
  router.push('/onboarding/complete')
}
</script>

<template>
  <WizardStep
    :title="$t('onboarding.analytics.title')"
    :description="$t('onboarding.analytics.description')"
    :tips="$t('onboarding.tips')"
  >
    <div
      v-if="fetchingSchema"
      class="flex justify-center py-8"
    >
      <UIcon
        name="tabler:loader"
        class="animate-spin w-8 h-8 text-gray-400"
      />
    </div>

    <UForm
      v-else
      id="analytics-form"
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <template
        v-for="field in fields"
        :key="field.key"
      >
        <WizardFormField
          v-if="isFieldVisible(field)"
          :label="$t(field.label || '')"
          :name="field.key"
          :required="field.ui.required"
          :help="$t(field.ui.help || '')"
        >
          <WizardCheckbox
            v-if="field.ui.type === 'toggle'"
            v-model="state[field.key]"
            :label="$t(field.label || '')"
          />
          <WizardInput
            v-else
            v-model="state[field.key]"
            :type="field.ui.type === 'url' ? 'url' : 'text'"
            :placeholder="field.ui.placeholder"
          />
        </WizardFormField>
      </template>
    </UForm>

    <template #actions>
      <WizardButton
        to="/onboarding/map"
        color="outline"
        size="lg"
        leading-icon="tabler:arrow-left"
      >
        {{ $t('onboarding.actions.previous') }}
      </WizardButton>
      <WizardButton
        type="submit"
        form="analytics-form"
        color="primary"
        size="lg"
        :disabled="fetchingSchema"
        trailing-icon="tabler:arrow-right"
      >
        {{ $t('onboarding.actions.completeSetup') }}
      </WizardButton>
    </template>
  </WizardStep>
</template>
