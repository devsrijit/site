import { Fragment } from "react";
import { COMMUNITY, ROLES, SKILLS } from "@/lib/work";
import { Arrow } from "./Arrow";

/** Sets each **marked** number in bold. */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}

/**
 * The work history on the home page. The facts come
 * from lib/work.ts, which the llms.txt text reads too.
 */
export function WorkHistory() {
  return (
    <section className="work page" id="history" aria-labelledby="work-title">
      <p className="title title--part">
        <span className="title-main" id="work-title">
          Work history
        </span>
      </p>

      <section className="sec work-sec" aria-labelledby="work-deploy">
        <h2 className="sec-h" id="work-deploy">
          Deployments
        </h2>
        <ol className="roles">
          {ROLES.map((r) => (
            <li className="role" key={r.id}>
              <div className="role-meta">
                <p className="role-dates t-label">{r.dates}</p>
                <h3 className="role-name">{r.name}</h3>
                <p className="role-role">{r.role}</p>
                <p className="role-note">{r.note}</p>
                {r.award || r.links.length ? (
                  <div className="role-links">
                    {r.award ? (
                      <a className="role-award" href={r.award.href} target="_blank" rel="noopener noreferrer">
                        {r.award.label}
                      </a>
                    ) : null}
                    {r.links.map((l) => (
                      <a key={l.href} className="role-link" href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                        <Arrow dir="right" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              <ul className="feat role-bullets">
                {r.bullets.map((b) => (
                  <li key={b}>
                    <Marked text={b} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <div className="work-grid">
        <section className="sec work-sec" aria-labelledby="work-service">
          <h2 className="sec-h" id="work-service">
            Community service, pro bono
          </h2>
          <ul className="service">
            {COMMUNITY.map((c) => (
              <li className="service-item" key={c.org}>
                <p className="role-dates t-label">{c.dates}</p>
                <h3 className="service-org">{c.org}</h3>
                <p className="role-role">{c.role}</p>
                <p className="service-text">{c.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="sec work-sec" aria-labelledby="work-process">
          <h2 className="sec-h" id="work-process">
            Process compatibility
          </h2>
          <table className="tbl tbl--order tbl--skills">
            <tbody>
              {SKILLS.map((s) => (
                <tr key={s.group}>
                  <th scope="row">{s.group}</th>
                  <td>{s.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

    </section>
  );
}
