# Technical Interview → Check al solicitar contrato

## Descripción del problema

En `/employer/processes`, el pipeline tiene tres etapas: **Intro Interview → Technical Interview → Contract Signing**.

Actualmente, la etapa **Technical Interview** muestra su ícono en estado `current` (número azul) incluso después de que el empleador haya solicitado el contrato. El check verde (`CircleCheck`) solo aparece si `currentStage` avanza más allá del índice de `technical_interview`.

**Objetivo:** Cuando el empleador hace clic en "Send Approval Request" (solicita el contrato), la etapa `technical_interview` debe mostrarse con check verde (completada), reflejando que esa fase ya finalizó y se está avanzando al siguiente paso.

---

## Análisis del estado actual

### `getStepState(index)` en [`process-timeline.tsx`](file:///c:/Users/Luismer/Desktop/Vene-Hire/Vene-Hire-main/components/process-timeline.tsx#L74-L79)

```typescript
function getStepState(index: number): 'completed' | 'current' | 'future' {
  if (status === 'hired') return 'completed';
  if (index < currentIndex) return 'completed';   // ← solo si el stage ya pasó
  if (index === currentIndex) return 'current';
  return 'future';
}
```

El `currentIndex` se calcula con `getStageIndex(currentStage)`.  
- `technical_interview` → index **1**  
- `contract_signing` → index **2**

Mientras `currentStage` sea `technical_interview`, el index 1 es `current` y el index 2 es `future`.

### `handleInitiateContract` en [`page.tsx`](file:///c:/Users/Luismer/Desktop/Vene-Hire/Vene-Hire-main/app/%28dashboard%29/employer/processes/page.tsx#L97-L101)

```typescript
const handleInitiateContract = useCallback(() => {
  if (!contractProcess) return;
  requestContractApproval(contractProcess.id);  // ← solo crea la solicitud
  setContractProcess(null);
}, [contractProcess, requestContractApproval]);
```

`requestContractApproval` crea el `ContractApprovalRequest` pero **no cambia `current_stage`** del proceso, por lo que la timeline no refleja el avance.

### Flujo actual vs. deseado

| Paso | Estado actual | Estado deseado |
|---|---|---|
| Employer programa entrevista técnica | `technical_interview` = current | igual |
| Employer solicita contrato | `technical_interview` = current ❌ | `technical_interview` = **completado ✅** |
| `contract_signing` muestra ícono FileText | `contract_signing` = current (FileText) | igual |

---

## Cambios propuestos

### Opción A (Recomendada) — Avanzar `current_stage` al solicitar contrato

Al llamar `requestContractApproval`, también actualizar `current_stage` a `contract_signing` en el proceso. Esto es semánticamente correcto: la entrevista técnica terminó y se pasa a la etapa de contrato.

---

### Componente: `lib/data-context.tsx`

#### [MODIFY] [data-context.tsx](file:///c:/Users/Luismer/Desktop/Vene-Hire/Vene-Hire-main/lib/data-context.tsx)

Dentro de `requestContractApprovalFn` (línea ~329), después de crear el `ContractApprovalRequest`, actualizar `current_stage` del proceso a `contract_signing`:

```diff
  const requestContractApprovalFn = useCallback(async (processId: string) => {
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    // ...
    if (req) setContractApprovalRequests((prev) => [...prev, req]);
+
+   // Avanzar el proceso a la etapa de contract_signing
+   const updatedProcess = { ...process, current_stage: 'contract_signing' as const };
+   setSelectionProcesses((prev) =>
+     prev.map((p) => p.id === processId ? updatedProcess : p)
+   );
+   api.upsertSelectionProcess(updatedProcess).catch(() => {});
+
    const n: Notification = { ... };
```

> [!IMPORTANT]
> Esto permite que `getStepState(1)` (technical_interview) retorne `'completed'` porque `currentIndex` pasará a ser 2, haciendo que `index(1) < currentIndex(2)`.

---

### Componente: `components/process-timeline.tsx` *(sin cambios necesarios)*

La lógica de `getStepState` ya maneja correctamente el check: cuando `index < currentIndex` retorna `'completed'`. Solo necesita que el `currentStage` del proceso sea `'contract_signing'`.

---

## Verificación del plan

### Flujo completo esperado tras el cambio

```
1. Proceso comienza en current_stage = 'intro_interview'
   → Timeline: [✅ Intro] [2 Technical] [FileText Contract]

2. Empleador programa Technical Interview
   → setProcessStage() cambia current_stage = 'technical_interview'
   → Timeline: [✅ Intro] [2 Technical (current)] [FileText Contract]

3. Empleador solicita Contract Signing
   → requestContractApproval() ahora también actualiza current_stage = 'contract_signing'
   → Timeline: [✅ Intro] [✅ Technical] [FileText Contract (current)] ✅
```

### Verificación manual
- En `/employer/processes`, con un proceso en etapa `technical_interview`, hacer clic en el ícono de Contract Signing → confirmar en el diálogo → verificar que `technical_interview` muestra check verde ✅ y `contract_signing` aparece como etapa actual.
- Verificar que la burbuja "Awaiting Admin Approval" sigue apareciendo (`hasApprovalPending` no se ve afectado).
- Verificar que no hay regresión en la lógica `isClickable` de `process-timeline.tsx`.

---

## Open Questions

> [!NOTE]
> ¿Debe el `contract_signing` pasar a `current` visualmente con el ícono de FileText en azul, o solo mostrar el ícono inactivo con el banner "Awaiting Admin Approval"? El comportamiento actual del componente ya muestra el FileText en azul cuando es `current`, lo cual parece correcto.
