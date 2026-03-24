import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_CHARACTER, MY_CHARACTERS } from '../queries';
import Step1_Origin from './Step1_Origin.js';
import Step2_Archetype from './Step2_Archetype.js';
import Step3_Traits from './Step3_Traits.js';
import Step4_Skills from './Step4_Skills.js';
import Step5_Disciplines from './Step5_Disciplines.js';
import Step6_Equipment from './Step6_Equipment.js';
import Step7_Review from './Step7_Review.js';

const STEPS = ['Origin', 'Archetype', 'Traits', 'Skills', 'Disciplines', 'Equipment', 'Review'];

export default function CharacterWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        name: '', age: '',
        originId: null, archetypeId: null,
        creationPoints: 300,    // 300 = Beginner, 500 = Practiced, 700 = Experienced
        // Seven Traits: range -4 to +4
        traits: { charisma: 0, constitution: 0, dexterity: 0, intelligence: 0, perception: 0, psyche: 0, strength: 0 },
        skills: [], // [{ skillId, sv }]
        disciplines: [], // [{ skillId, name, level }]
        specialties: [], // [{ skillId, discipline, name, level }]
        equipment: [] // [{ itemId, quantity }]
    });

    const [createCharacter, { loading, error }] = useMutation(CREATE_CHARACTER, {
        refetchQueries: [{ query: MY_CHARACTERS }]
    });

    function update(patch) { setForm(f => ({ ...f, ...patch })); }

    async function handleSubmit() {
        try {
            await createCharacter({ variables: {
                input: {
                    archetypeId:    form.archetypeId,
                    originId:       form.originId,
                    name:           form.name,
                    age:            parseInt(form.age) || undefined,
                    creationPoints: form.creationPoints,
                    traits:         form.traits,
                    skills:         form.skills,
                    disciplines:    form.disciplines,
                    specialties:    form.specialties,
                    equipment:      form.equipment
                }
            }});
            navigate('/');
        } catch (e) {
            console.error('Error creating character:', e);
        }
    }

    const stepProps = { form, update };
    const steps = [
        <Step1_Origin      {...stepProps} />,
        <Step2_Archetype   {...stepProps} />,
        <Step3_Traits      {...stepProps} />,
        <Step4_Skills      {...stepProps} />,
        <Step5_Disciplines {...stepProps} />,
        <Step6_Equipment   {...stepProps} />,
        <Step7_Review      form={form} onSubmit={handleSubmit} loading={loading} error={error} />
    ];

    return (
        <div className="tc-page">
            <h2>Create Character - Step {step + 1}: {STEPS[step]}</h2>
            <div className="wizard-steps">
                {STEPS.map((s, i) => (
                    <span key={i} className={`wizard-steps-label${i === step ? ' active' : i < step ? ' done' : ''}`}>{s}</span>
                ))}
            </div>
            <hr className="tc-rule" />
            {steps[step]}
            <div style={{ marginTop: 16 }}>
                {step > 0 && <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>}
                {step < steps.length - 1 && <button onClick={() => setStep(s => s + 1)}>Next</button>}
            </div>
        </div>
    );
}