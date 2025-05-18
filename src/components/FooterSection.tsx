import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FooterSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/40">
      <div className="container max-w-6xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <div className="font-bold text-xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                {t("general.appName")}
              </div>
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">
              {t("hero.description")}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-sm">
              {t("navigation.products")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.features")}
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.pricing")}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.integrations")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-sm">
              {t("navigation.resources")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.docs")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.guides")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.support")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.status")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-sm">
              {t("navigation.company")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.about")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.blog")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.careers")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("navigation.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} {t("general.appName")}.{" "}
            {t("navigation.copyright")}
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">
              {t("navigation.terms")}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t("navigation.privacy")}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t("navigation.cookies")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
